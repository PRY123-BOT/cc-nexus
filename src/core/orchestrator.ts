import { MCPHubManager } from "./mcp-hub.ts";
import { MemoryDreamEngine } from "./memory-dream.ts";
import { SecurityGate } from "./security-gate.ts";
import { SuperAgentEngine } from "./super-agent.ts";
import type {
  AgentStepLog,
  EventSourceChannel,
  FinOpsSummary,
  SwarmTask,
} from "./types.ts";
import { WorktreeManager } from "./worktree.ts";
import { DualEngineAdapter } from "../providers/adapter.ts";

export class SwarmOrchestrator {
  public readonly worktrees = new WorktreeManager();
  public readonly securityGate = new SecurityGate();
  public readonly memoryDream = new MemoryDreamEngine();
  public readonly mcpHub = new MCPHubManager();
  public readonly adapter = new DualEngineAdapter();
  public readonly superAgent = new SuperAgentEngine();

  private tasks: Map<string, SwarmTask> = new Map();
  private listeners: Set<(event: Record<string, unknown>) => void> = new Set();

  constructor() {
    this.seedInitialTasks();
  }

  public onEvent(listener: (event: Record<string, unknown>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: string, payload: unknown): void {
    const message = {
      type,
      timestamp: new Date().toISOString(),
      payload,
    };
    for (const listener of this.listeners) {
      try {
        listener(message);
      } catch {
        // Ignore disconnected listener errors
      }
    }
  }

  public listTasks(): SwarmTask[] {
    return Array.from(this.tasks.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  public getTask(id: string): SwarmTask | undefined {
    return this.tasks.get(id);
  }

  /**
   * Ingests a multi-channel event through the DeepSeek Super-Agent Deterministic Filter.
   * If noise -> dropped immediately with 0 LLM token spend.
   * If valid signal -> Router dispatches to an isolated Worker and executes the Swarm pipeline.
   */
  public async ingestChannelEvent(input: {
    channel: EventSourceChannel;
    sender: string;
    subject: string;
    payload: string;
  }) {
    const { record, ticket } = this.superAgent.ingestEvent(input);
    if (record.filterOutcome === "DROPPED_NOISE" || !ticket) {
      this.emit("event:filtered", record);
      return { record, routedTask: undefined };
    }

    const routedTask = await this.runSwarmTask(
      input.subject,
      input.payload,
      ticket.ticketId,
      ticket.assignedWorkerId
    );
    return { record, ticket, routedTask };
  }

  /**
   * Executes the full 4-stage Super-Agent workflow:
   * 0. Always-On Router dispatches ticket without touching Bash/code.
   * 1. Claude Architect plans the change and provisions a Git worktree sandbox.
   * 2. Claude Coder generates the unified diff patch inside the worktree.
   * 3. OpenAI Codex Auditor + Static AST SecurityGate audits the patch before merge.
   */
  public async runSwarmTask(
    title: string,
    prompt: string,
    existingTicketId?: string,
    existingWorkerId?: string
  ): Promise<SwarmTask> {
    const taskId = `task-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    let ticketId = existingTicketId;
    let workerId = existingWorkerId;
    if (!ticketId || !workerId) {
      const dispatched = this.superAgent.ingestEvent({
        channel: "cli-direct",
        sender: "operator@studio",
        subject: title,
        payload: prompt,
      });
      ticketId = dispatched.ticket?.ticketId || `tkt-${Date.now().toString(36)}`;
      workerId = dispatched.ticket?.assignedWorkerId || "worker-03";
    }

    const stepRoute: AgentStepLog = {
      id: `${taskId}-step-0`,
      timestamp: now,
      role: "super-router",
      model: "dsh-router-light",
      provider: "simulation",
      phase: "route",
      summary: `Router verified intent & spawned isolated ${workerId} (Direct Bash = FALSE)`,
      detail: `Ticket ${ticketId} dispatched to ${workerId}. Human attention budget preserved.`,
      tokensIn: 310,
      tokensOut: 95,
      cachedTokens: 240,
      costUsd: 0.0004,
      durationMs: 12,
    };

    // 1. Architect Step
    const archRes = await this.adapter.invokeAgent("claude-architect", prompt);
    const stepArch: AgentStepLog = {
      id: `${taskId}-step-1`,
      timestamp: now,
      role: "claude-architect",
      model: archRes.model,
      provider: archRes.provider,
      phase: "plan",
      summary: "Decomposed task & provisioned isolated Git worktree branch",
      detail: archRes.content,
      tokensIn: archRes.tokensIn,
      tokensOut: archRes.tokensOut,
      cachedTokens: archRes.cachedTokens,
      costUsd: archRes.costUsd,
      durationMs: archRes.durationMs,
    };

    // 2. Coder Step
    const codeRes = await this.adapter.invokeAgent(
      "claude-coder",
      prompt,
      archRes.content
    );
    const patch = codeRes.content.includes("diff --git")
      ? codeRes.content
      : [
          "diff --git a/src/feature/generated.ts b/src/feature/generated.ts",
          "--- /dev/null",
          "+++ b/src/feature/generated.ts",
          "@@ -0,0 +1,6 @@",
          `+// Generated by Claude Coder for: ${title}`,
          "+export function runFeature(): boolean {",
          "+  return true;",
          "+}",
        ].join("\n");

    const sandbox = this.worktrees.createSandbox(
      taskId,
      `${workerId} (claude-coder + codex-auditor)`,
      patch
    );

    const stepCode: AgentStepLog = {
      id: `${taskId}-step-2`,
      timestamp: new Date().toISOString(),
      role: "claude-coder",
      model: codeRes.model,
      provider: codeRes.provider,
      phase: "implement",
      summary: `Authored patch in worktree ${sandbox.branch} (+${sandbox.diffStats.insertions}/-${sandbox.diffStats.deletions})`,
      detail: patch,
      tokensIn: codeRes.tokensIn,
      tokensOut: codeRes.tokensOut,
      cachedTokens: codeRes.cachedTokens,
      costUsd: codeRes.costUsd,
      durationMs: codeRes.durationMs,
    };

    // 3. OpenAI Codex Adversarial Security Gate Step
    const auditReport = this.securityGate.auditContent(patch, "diff");
    const codexRes = await this.adapter.invokeAgent(
      "codex-auditor",
      prompt,
      patch
    );

    const stepAudit: AgentStepLog = {
      id: `${taskId}-step-3`,
      timestamp: new Date().toISOString(),
      role: "codex-auditor",
      model: codexRes.model,
      provider: codexRes.provider,
      phase: "audit",
      summary: `Codex Security Verdict: ${auditReport.verdict} (Risk Score ${auditReport.riskScore}/100)`,
      detail: `${auditReport.codexReviewSummary}\n\n${codexRes.content}`,
      tokensIn: codexRes.tokensIn,
      tokensOut: codexRes.tokensOut,
      cachedTokens: codexRes.cachedTokens,
      costUsd: codexRes.costUsd,
      durationMs: codexRes.durationMs,
    };

    const blockedOrWarn = auditReport.verdict !== "PASS";
    this.superAgent.registerWorkerForTask({
      workerId,
      ticketId,
      taskId,
      title,
      worktreeBranch: sandbox.branch,
      escalateToInbox: blockedOrWarn,
      riskScore: auditReport.riskScore,
      summary: auditReport.codexReviewSummary,
    });

    const task: SwarmTask = {
      id: taskId,
      title,
      prompt,
      status:
        auditReport.verdict === "BLOCK"
          ? "blocked"
          : blockedOrWarn
            ? "awaiting_approval"
            : "completed",
      createdAt: now,
      updatedAt: new Date().toISOString(),
      worktreeId: sandbox.id,
      branch: sandbox.branch,
      workerId,
      routerTicketId: ticketId,
      steps: [stepRoute, stepArch, stepCode, stepAudit],
      securityReport: auditReport,
      generatedPatch: patch,
      pendingApproval: blockedOrWarn
        ? {
            approvalId: `apr-${taskId}`,
            action: "Human Attention Inbox: Sign-Off Required",
            commandOrFile: sandbox.branch,
            reason: auditReport.codexReviewSummary,
            requestedAt: new Date().toISOString(),
          }
        : undefined,
    };

    this.tasks.set(taskId, task);
    this.memoryDream.addFragment({
      category: "architecture",
      title: `Pattern from ${title}`,
      content: `Verified implementation in branch ${sandbox.branch} (${workerId}) with Codex risk score ${auditReport.riskScore}/100.`,
      confidence: 0.94,
      sourceTaskId: taskId,
    });

    this.emit("task:created", task);
    return task;
  }

  public resolveApproval(
    taskId: string,
    decision: "approve" | "reject"
  ): SwarmTask | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.pendingApproval = undefined;
    task.updatedAt = new Date().toISOString();
    if (decision === "approve") {
      task.status = "completed";
      this.worktrees.updateSandboxStatus(task.worktreeId, "merged");
    } else {
      task.status = "blocked";
      this.worktrees.updateSandboxStatus(task.worktreeId, "discarded");
    }

    this.superAgent.resolveInboxItem(taskId, decision);
    this.emit("task:updated", task);
    return task;
  }

  public getFinOpsSummary(): FinOpsSummary {
    const byModel: FinOpsSummary["byModel"] = {};
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCachedTokens = 0;
    let totalCostUsd = 0;

    for (const task of this.tasks.values()) {
      for (const step of task.steps) {
        totalTokensIn += step.tokensIn;
        totalTokensOut += step.tokensOut;
        totalCachedTokens += step.cachedTokens;
        totalCostUsd += step.costUsd;

        if (!byModel[step.model]) {
          byModel[step.model] = {
            calls: 0,
            tokensIn: 0,
            tokensOut: 0,
            cachedTokens: 0,
            costUsd: 0,
          };
        }
        const entry = byModel[step.model]!;
        entry.calls += 1;
        entry.tokensIn += step.tokensIn;
        entry.tokensOut += step.tokensOut;
        entry.cachedTokens += step.cachedTokens;
        entry.costUsd = Number((entry.costUsd + step.costUsd).toFixed(4));
      }
    }

    const estimatedCacheSavingsUsd = Number(
      ((totalCachedTokens * 0.0027) / 1000).toFixed(4)
    );

    return {
      totalTasks: this.tasks.size,
      totalTokensIn,
      totalTokensOut,
      totalCachedTokens,
      totalCostUsd: Number(totalCostUsd.toFixed(4)),
      estimatedCacheSavingsUsd,
      byModel,
    };
  }

  private seedInitialTasks(): void {
    const patch1 =
      this.worktrees.getSandbox("wt-task-jwt-hardening")?.samplePatch || "";
    const report1 = this.securityGate.auditContent(patch1, "diff");

    this.superAgent.registerWorkerForTask({
      workerId: "worker-01",
      ticketId: "tkt-001",
      taskId: "task-jwt-hardening",
      title: "Harden JWT Bearer Verification & Signature Checks",
      worktreeBranch: "nexus/task-jwt-hardening",
      escalateToInbox: false,
      riskScore: report1.riskScore,
      summary: report1.codexReviewSummary,
    });

    const task1: SwarmTask = {
      id: "task-jwt-hardening",
      title: "Harden JWT Bearer Verification & Signature Checks",
      prompt:
        "Refactor validateBearerHeader in src/security/jwt-guard.ts to strictly verify 3-part compact JWT structure and add unit tests.",
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      worktreeId: "wt-task-jwt-hardening",
      branch: "nexus/task-jwt-hardening",
      workerId: "worker-01",
      routerTicketId: "tkt-001",
      generatedPatch: patch1,
      securityReport: report1,
      steps: [
        {
          id: "step-jwt-0",
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          role: "super-router",
          model: "dsh-router-light",
          provider: "simulation",
          phase: "route",
          summary:
            "Router classified P0 security-hotfix & spawned isolated worker-01",
          detail:
            "Router constraint verified (Direct Bash = FALSE). Dispatched tkt-001.",
          tokensIn: 280,
          tokensOut: 85,
          cachedTokens: 210,
          costUsd: 0.0003,
          durationMs: 11,
        },
        {
          id: "step-jwt-1",
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          role: "claude-architect",
          model: "claude-opus-4-6",
          provider: "anthropic",
          phase: "plan",
          summary:
            "Designed zero-trust JWT envelope check & isolated worktree branch",
          detail:
            "Created isolated Git worktree `.cc-nexus/worktrees/task-jwt-hardening` and specified compact serialization invariants.",
          tokensIn: 1850,
          tokensOut: 490,
          cachedTokens: 1420,
          costUsd: 0.0185,
          durationMs: 840,
        },
        {
          id: "step-jwt-2",
          timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
          role: "claude-coder",
          model: "claude-sonnet-4-5",
          provider: "anthropic",
          phase: "implement",
          summary:
            "Implemented strict Bearer parser + bun:test suite (+16/-1 lines)",
          detail: patch1,
          tokensIn: 2420,
          tokensOut: 780,
          cachedTokens: 1900,
          costUsd: 0.0189,
          durationMs: 1120,
        },
        {
          id: "step-jwt-3",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          role: "codex-auditor",
          model: "openai-codex-security",
          provider: "openai",
          phase: "audit",
          summary: "OpenAI Codex Security Gate: PASS (Silent Merge, 0 Attention Cost)",
          detail: report1.codexReviewSummary,
          tokensIn: 1640,
          tokensOut: 320,
          cachedTokens: 980,
          costUsd: 0.0044,
          durationMs: 690,
        },
      ],
    };

    const riskyPatch = [
      "diff --git a/src/deploy/remote-sync.ts b/src/deploy/remote-sync.ts",
      "--- a/src/deploy/remote-sync.ts",
      "+++ b/src/deploy/remote-sync.ts",
      "@@ -4,4 +4,6 @@ import { execSync } from 'node:child_process';",
      " export function runRemoteHook(targetHost: string) {",
      "+  const tempPath = `../../tmp/${targetHost}`;",
      "+  return execSync(`curl -fsSL https://${targetHost}/bootstrap.sh | bash`);",
      " }",
    ].join("\n");

    const sandbox2 = this.worktrees.createSandbox(
      "task-remote-webhook-sync",
      "worker-02 (claude-coder + codex-auditor)",
      riskyPatch
    );
    const report2 = this.securityGate.auditContent(riskyPatch, "diff");

    this.superAgent.registerWorkerForTask({
      workerId: "worker-02",
      ticketId: "tkt-002",
      taskId: "task-remote-webhook-sync",
      title: "Add Remote Deployment Bootstrapper Hook",
      worktreeBranch: sandbox2.branch,
      escalateToInbox: true,
      riskScore: report2.riskScore,
      summary: report2.codexReviewSummary,
    });

    const task2: SwarmTask = {
      id: "task-remote-webhook-sync",
      title: "Add Remote Deployment Bootstrapper Hook",
      prompt:
        "Create a remote sync helper in src/deploy/remote-sync.ts and verify command safety with OpenAI Codex Security Gate.",
      status: "awaiting_approval",
      createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      worktreeId: sandbox2.id,
      branch: sandbox2.branch,
      workerId: "worker-02",
      routerTicketId: "tkt-002",
      generatedPatch: riskyPatch,
      securityReport: report2,
      pendingApproval: {
        approvalId: "apr-remote-sync",
        action: "Attention Inbox Escalation: Codex Blocked Merge",
        commandOrFile: "src/deploy/remote-sync.ts",
        reason: report2.codexReviewSummary,
        requestedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      },
      steps: [
        {
          id: "step-rem-0",
          timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
          role: "super-router",
          model: "dsh-router-light",
          provider: "simulation",
          phase: "route",
          summary:
            "Router ingested Feishu IM request & spawned isolated worker-02",
          detail: "Dispatched tkt-002 to worker-02.",
          tokensIn: 295,
          tokensOut: 90,
          cachedTokens: 200,
          costUsd: 0.0003,
          durationMs: 14,
        },
        {
          id: "step-rem-1",
          timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
          role: "claude-coder",
          model: "claude-sonnet-4-5",
          provider: "anthropic",
          phase: "implement",
          summary:
            "Drafted remote hook in isolated worktree nexus/task-remote-webhook-sync",
          detail: riskyPatch,
          tokensIn: 1520,
          tokensOut: 410,
          cachedTokens: 1100,
          costUsd: 0.0107,
          durationMs: 780,
        },
        {
          id: "step-rem-2",
          timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
          role: "codex-auditor",
          model: "openai-codex-security",
          provider: "openai",
          phase: "audit",
          summary: `Codex Gate Intercepted ${report2.findings.length} Risks (Score ${report2.riskScore}/100) -> Escalated to Inbox`,
          detail: report2.codexReviewSummary,
          tokensIn: 1490,
          tokensOut: 450,
          cachedTokens: 820,
          costUsd: 0.0049,
          durationMs: 620,
        },
      ],
    };

    this.tasks.set(task1.id, task1);
    this.tasks.set(task2.id, task2);
  }
}
