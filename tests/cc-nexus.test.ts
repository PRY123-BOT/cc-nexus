import { describe, expect, it } from "bun:test";
import { MCPHubManager } from "../src/core/mcp-hub.ts";
import { MemoryDreamEngine } from "../src/core/memory-dream.ts";
import { SecurityGate } from "../src/core/security-gate.ts";
import { SuperAgentEngine } from "../src/core/super-agent.ts";
import { WorktreeManager } from "../src/core/worktree.ts";
import { createNexusServer } from "../src/server/index.ts";

describe("CC-Nexus v3.0 Desktop Suite (Beginner · Office · Developer Modes)", () => {
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

    it("enforces Router no-direct-bash invariant and classifies office, beginner, and security intents", () => {
      const sa = new SuperAgentEngine();
      expect(sa.routerAllowDirectBash).toBe(false);

      const officeSig = sa.ingestEvent({
        channel: "feishu-im",
        sender: "pm@org",
        subject: "生成部门周报与会议待办",
        payload: "汇总本周项目进度",
      });
      expect(officeSig.ticket?.intentCategory).toBe("office-doc");

      const secSig = sa.ingestEvent({
        channel: "github-webhook",
        sender: "sec-lead@org",
        subject: "Fix JWT signature bypass vulnerability",
        payload: "Enforce strict HMAC verification in auth middleware",
      });
      expect(secSig.ticket?.priority).toBe("P0");
      expect(secSig.ticket?.routerConstraintVerified).toBe(true);
    });

    it("detects worker tool loops and auto-heals via Watchdog without consuming human attention", () => {
      const sa = new SuperAgentEngine();
      const incident = sa.simulateWatchdogLoopAndHeal("worker-01");
      expect(incident.anomalyType).toBe("infinite-tool-loop");
      expect(incident.actionTaken).toBe("auto-healed-reset");
      expect(sa.getTelemetry().routerDirectExecViolations).toBe(0);
    });
  });

  describe("SecurityGate (Code Security + Office Document Privacy Redaction)", () => {
    const gate = new SecurityGate();

    it("passes clean unified diffs and clean office documents with riskScore 0", () => {
      const cleanDiff = [
        "diff --git a/src/math.ts b/src/math.ts",
        "+++ b/src/math.ts",
        "+export const add = (a: number, b: number) => a + b;",
      ].join("\n");

      const report = gate.auditContent(cleanDiff, "diff");
      expect(report.verdict).toBe("PASS");
      expect(report.riskScore).toBe(0);
    });

    it("detects unredacted personal ID numbers (CCN-SEC-010) in office contracts", () => {
      const contractText =
        "采购合同附件：乙方签约代表身份证号：31010119900307881X，请核对。";
      const report = gate.auditContent(contractText, "document");
      expect(report.verdict).toBe("WARN");
      expect(report.findings.some((f) => f.ruleId === "CCN-SEC-010")).toBe(true);
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

  describe("SwarmOrchestrator & Sidecar HTTP API (v3.0 Multi-Persona)", () => {
    it("executes Beginner, Office, and Developer tasks and serves all v3 REST endpoints", async () => {
      const { server, orchestrator } = createNexusServer(0);
      const baseUrl = `http://localhost:${server.port}`;

      try {
        const statusRes = await fetch(`${baseUrl}/api/status`);
        expect(statusRes.status).toBe(200);
        const statusJson = (await statusRes.json()) as {
          version: string;
          tasks: Array<{ persona: string }>;
        };
        expect(statusJson.version).toBe("3.0.0");
        expect(statusJson.tasks.some((t) => t.persona === "office")).toBe(true);
        expect(statusJson.tasks.some((t) => t.persona === "beginner")).toBe(
          true
        );

        const createOfficeRes = await fetch(`${baseUrl}/api/tasks`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: "生成月度经营分析简报",
            prompt: "汇总各区域营收指标并提炼三项待办",
            persona: "office",
          }),
        });
        expect(createOfficeRes.status).toBe(201);
        const officeTask = (await createOfficeRes.json()) as {
          persona: string;
          deliverable?: { format: string };
        };
        expect(officeTask.persona).toBe("office");
        expect(officeTask.deliverable?.format).toBe("markdown-doc");

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
      } finally {
        server.stop(true);
      }
    });
  });
});
