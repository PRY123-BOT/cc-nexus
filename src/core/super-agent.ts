import type {
  AttentionInboxItem,
  EventSourceChannel,
  FilteredEventRecord,
  RawInboundEvent,
  RouterTicket,
  SuperAgentTelemetry,
  WatchdogIncident,
  WorkerNode,
} from "./types.ts";

/**
 * DeepSeek Super-Agent (dsh-superagent) Architecture Engine
 *
 * Core Philosophy:
 *   "Take as little human attention as possible, and give as much value as possible."
 *
 * Architectural Invariants:
 *   1. Deterministic Event Pre-Filter drops high-noise webhooks/IM chatter BEFORE LLM invocation.
 *   2. Always-On Router Agent is strictly forbidden from executing Bash or editing files directly.
 *   3. Isolated Worker Agents execute concurrently in dedicated Git worktrees.
 *   4. Watchdog Daemon detects infinite tool loops / stalled workers and auto-heals them.
 *   5. Human Attention Inbox surfaces ONLY items requiring high-level human sign-off.
 */
export class SuperAgentEngine {
  public readonly routerAllowDirectBash = false as const;
  private readonly maxAttentionSlots = 5;

  private eventLog: FilteredEventRecord[] = [];
  private tickets: Map<string, RouterTicket> = new Map();
  private workers: Map<string, WorkerNode> = new Map();
  private watchdogIncidents: WatchdogIncident[] = [];
  private inbox: Map<string, AttentionInboxItem> = new Map();

  constructor() {
    this.seedInitialSuperAgentState();
  }

  /**
   * Stage 1: Deterministic Code Filter (Pre-LLM Noise Gate)
   * Filters out noisy webhook pings, bot notifications, and trivial IM messages at zero LLM token cost.
   */
  public ingestEvent(input: {
    channel: EventSourceChannel;
    sender: string;
    subject: string;
    payload: string;
  }): {
    record: FilteredEventRecord;
    ticket?: RouterTicket;
  } {
    const raw: RawInboundEvent = {
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      channel: input.channel,
      sender: input.sender,
      subject: input.subject,
      payload: input.payload,
      timestamp: new Date().toISOString(),
    };

    const text = `${raw.subject} ${raw.payload}`.toLowerCase().trim();

    // Rule 1: Automated dependency / bot noise without actionable failure
    if (
      raw.sender.includes("[bot]") &&
      !text.includes("vulnerability") &&
      !text.includes("security") &&
      !text.includes("fail")
    ) {
      const record: FilteredEventRecord = {
        event: raw,
        filterOutcome: "DROPPED_NOISE",
        filterRuleId: "DSH-FLT-01 (Bot Chime Filter)",
        reason: "Ignored non-critical bot notification before LLM wakeup.",
        tokensSavedEstimate: 1950,
      };
      this.eventLog.unshift(record);
      return { record };
    }

    // Rule 2: Trivial IM chat acknowledgments ("ok", "收到", "+1", "lgtm", "thanks")
    if (
      raw.channel === "feishu-im" &&
      /^(ok|收到|好的|\+1|lgtm|thanks|thx|ack)[!！.。]*$/i.test(raw.payload.trim())
    ) {
      const record: FilteredEventRecord = {
        event: raw,
        filterOutcome: "DROPPED_NOISE",
        filterRuleId: "DSH-FLT-02 (IM Ephemeral Ack)",
        reason: "Dropped conversational acknowledgment; zero engineering intent.",
        tokensSavedEstimate: 1420,
      };
      this.eventLog.unshift(record);
      return { record };
    }

    // Rule 3: Formatting-only / docs-only CI pass notifications
    if (
      raw.channel === "ci-pipeline" &&
      text.includes("passed") &&
      !text.includes("error")
    ) {
      const record: FilteredEventRecord = {
        event: raw,
        filterOutcome: "DROPPED_NOISE",
        filterRuleId: "DSH-FLT-03 (Green CI Heartbeat)",
        reason: "Routine green CI pass suppressed to preserve human attention.",
        tokensSavedEstimate: 2100,
      };
      this.eventLog.unshift(record);
      return { record };
    }

    // Valid signal -> Forward to Always-On Router Agent
    const ticket = this.dispatchViaRouter(raw);
    const record: FilteredEventRecord = {
      event: raw,
      filterOutcome: "ROUTED_TO_WORKER",
      filterRuleId: "DSH-PASS-SIGNAL",
      reason: `High-signal ${ticket.intentCategory} intent routed to ${ticket.assignedWorkerId}`,
      tokensSavedEstimate: 0,
      routedTicketId: ticket.ticketId,
    };
    this.eventLog.unshift(record);
    return { record, ticket };
  }

  /**
   * Stage 2: Always-On Router Agent
   * Strictly dispatches work to an isolated Worker without executing code or Bash itself.
   */
  public dispatchViaRouter(event: RawInboundEvent): RouterTicket {
    const text = `${event.subject} ${event.payload}`.toLowerCase();
    const intentCategory: RouterTicket["intentCategory"] =
      text.includes("cve") ||
      text.includes("secret") ||
      text.includes("auth") ||
      text.includes("jwt") ||
      text.includes("pkce") ||
      text.includes("security")
        ? "security-hotfix"
        : text.includes("ci") || text.includes("test") || text.includes("build")
          ? "ci-repair"
          : text.includes("refactor") || text.includes("clean")
            ? "refactor"
            : "feature";

    const priority: RouterTicket["priority"] =
      intentCategory === "security-hotfix"
        ? "P0"
        : intentCategory === "ci-repair"
          ? "P1"
          : "P2";

    const index = this.tickets.size + 1;
    const workerId = `worker-${String(index).padStart(2, "0")}`;
    const slug = event.subject
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 26);

    const ticket: RouterTicket = {
      ticketId: `tkt-${String(index).padStart(3, "0")}`,
      sourceEventId: event.id,
      intentCategory,
      priority,
      assignedWorkerId: workerId,
      worktreeBranch: `nexus/${slug || workerId}`,
      routerConstraintVerified: !this.routerAllowDirectBash,
      dispatchedAt: new Date().toISOString(),
    };

    this.tickets.set(ticket.ticketId, ticket);
    return ticket;
  }

  /**
   * Registers or updates an isolated Worker Agent tied to a SwarmTask.
   */
  public registerWorkerForTask(params: {
    workerId?: string;
    ticketId?: string;
    taskId: string;
    title: string;
    worktreeBranch: string;
    escalateToInbox: boolean;
    riskScore: number;
    summary: string;
  }): WorkerNode {
    const workerId =
      params.workerId ||
      `worker-${String(this.workers.size + 1).padStart(2, "0")}`;
    const ticketId =
      params.ticketId || `tkt-${String(this.tickets.size + 1).padStart(3, "0")}`;

    const worker: WorkerNode = {
      workerId,
      ticketId,
      taskId: params.taskId,
      title: params.title,
      worktreeBranch: params.worktreeBranch,
      status: params.escalateToInbox ? "escalated_inbox" : "completed_silent",
      heartbeatLatencyMs: 28 + (this.workers.size * 11) % 45,
      toolCallsCount: params.escalateToInbox ? 7 : 5,
      loopDetected: false,
      tokenBudgetUsedPct: params.escalateToInbox ? 64 : 38,
      updatedAt: new Date().toISOString(),
    };

    this.workers.set(workerId, worker);

    if (params.escalateToInbox) {
      const inboxId = `inb-${params.taskId}`;
      this.inbox.set(inboxId, {
        inboxId,
        taskId: params.taskId,
        workerId,
        category: "security-gate-block",
        severity: params.riskScore >= 50 ? "critical" : "high",
        title: params.title,
        summary: params.summary,
        branch: params.worktreeBranch,
        riskScore: params.riskScore,
        createdAt: new Date().toISOString(),
        resolved: false,
      });
    }

    return worker;
  }

  /**
   * Stage 3: Watchdog Daemon Inspection & Auto-Heal
   * Detects infinite tool loops (e.g. Worker calling identical grep/bash 4x in a row)
   * and automatically resets the stuck context or escalates.
   */
  public simulateWatchdogLoopAndHeal(targetWorkerId?: string): WatchdogIncident {
    const workersList = Array.from(this.workers.values());
    const worker =
      (targetWorkerId ? this.workers.get(targetWorkerId) : undefined) ||
      workersList[0];

    const workerId = worker ? worker.workerId : "worker-01";
    if (worker) {
      worker.status = "healed_by_watchdog";
      worker.loopDetected = false;
      worker.heartbeatLatencyMs = 21;
      worker.updatedAt = new Date().toISOString();
    }

    const incident: WatchdogIncident = {
      incidentId: `wdg-${Date.now().toString(36)}`,
      workerId,
      anomalyType: "infinite-tool-loop",
      signature: "Repeated identical AST patch attempt (cycle count = 4)",
      actionTaken: "auto-healed-reset",
      timestamp: new Date().toISOString(),
      detail: `Watchdog intercepted cyclic tool call in ${workerId}, rewound Git worktree HEAD~1, injected anti-loop constraint into worker prompt, and resumed execution without interrupting human attention.`,
    };

    this.watchdogIncidents.unshift(incident);
    return incident;
  }

  /**
   * Stage 4: Resolve an item in the Human Attention Inbox
   */
  public resolveInboxItem(
    taskIdOrInboxId: string,
    decision: "approve" | "reject"
  ): AttentionInboxItem | undefined {
    const item =
      this.inbox.get(taskIdOrInboxId) ||
      Array.from(this.inbox.values()).find((i) => i.taskId === taskIdOrInboxId);

    if (!item) return undefined;
    item.resolved = true;
    item.resolution = decision === "approve" ? "approved" : "rejected";

    const worker = this.workers.get(item.workerId);
    if (worker) {
      worker.status = "completed_silent";
      worker.updatedAt = new Date().toISOString();
    }
    return item;
  }

  public getTelemetry(): SuperAgentTelemetry {
    const unresolvedInbox = Array.from(this.inbox.values()).filter(
      (i) => !i.resolved
    ).length;
    const totalEvents = this.eventLog.length;
    const dropped = this.eventLog.filter(
      (e) => e.filterOutcome === "DROPPED_NOISE"
    ).length;
    const tokensSaved = this.eventLog.reduce(
      (sum, e) => sum + e.tokensSavedEstimate,
      0
    );
    const silentCount = Array.from(this.workers.values()).filter(
      (w) => w.status === "completed_silent" || w.status === "healed_by_watchdog"
    ).length;

    return {
      attentionSlotsUsed: Math.min(this.maxAttentionSlots, unresolvedInbox),
      attentionSlotsMax: this.maxAttentionSlots,
      totalEventsIngested: totalEvents,
      noiseEventsDropped: dropped,
      noiseFilterRatioPct:
        totalEvents > 0 ? Math.round((dropped / totalEvents) * 100) : 0,
      tokensSavedByFilter: tokensSaved,
      silentCompletionsCount: silentCount,
      routerDirectExecViolations: 0,
    };
  }

  public getSnapshot(): {
    telemetry: SuperAgentTelemetry;
    inbox: AttentionInboxItem[];
    workers: WorkerNode[];
    tickets: RouterTicket[];
    events: FilteredEventRecord[];
    watchdog: WatchdogIncident[];
  } {
    return {
      telemetry: this.getTelemetry(),
      inbox: Array.from(this.inbox.values()),
      workers: Array.from(this.workers.values()),
      tickets: Array.from(this.tickets.values()),
      events: this.eventLog.slice(0, 25),
      watchdog: this.watchdogIncidents.slice(0, 15),
    };
  }

  private seedInitialSuperAgentState(): void {
    // Seed realistic multi-channel events demonstrating deterministic noise filtering
    this.ingestEvent({
      channel: "github-webhook",
      sender: "dependabot[bot]",
      subject: "Bump eslint-config-prettier from 9.0.0 to 9.1.0",
      payload: "Routine devDependency minor bump; all checks green.",
    });

    this.ingestEvent({
      channel: "feishu-im",
      sender: "dev-lead@team",
      subject: "Group Chat Reply",
      payload: "收到",
    });

    this.ingestEvent({
      channel: "ci-pipeline",
      sender: "github-actions[bot]",
      subject: "Nightly lint & format check passed",
      payload: "Workflow completed with status: passed in 14s.",
    });

    this.ingestEvent({
      channel: "github-webhook",
      sender: "security-audit@org",
      subject: "Harden JWT Bearer Verification & Signature Checks",
      payload:
        "Issue #104: Enforce strict 3-segment JWT compact serialization validation in src/security/jwt-guard.ts.",
    });

    this.ingestEvent({
      channel: "feishu-im",
      sender: "sre-oncall@team",
      subject: "Add Remote Deployment Bootstrapper Hook",
      payload:
        "Please add a remote sync helper in src/deploy/remote-sync.ts and verify command safety with OpenAI Codex Security Gate.",
    });

    this.watchdogIncidents.push({
      incidentId: "wdg-init-01",
      workerId: "worker-01",
      anomalyType: "heartbeat-stall",
      signature: "Subprocess transient RPC wait > 1200ms during AST indexing",
      actionTaken: "auto-healed-reset",
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      detail:
        "Watchdog re-established worker RPC stream automatically in 18ms; zero human interruption required.",
    });
  }
}
