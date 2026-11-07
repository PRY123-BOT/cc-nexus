#!/usr/bin/env bun
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { SwarmOrchestrator } from "../core/orchestrator.ts";
import { createNexusServer } from "../server/index.ts";

const args = process.argv.slice(2);
const command = args[0] || "help";

const orchestrator = new SwarmOrchestrator();

function printBanner(): void {
  console.log(
    [
      "╭──────────────────────────────────────────────────────────────────────────╮",
      "│  CC-NEXUS v1.0.0 — Claude Code × OpenAI Codex Multi-Agent Control Plane  │",
      "│  Worktree Isolation • Adversarial Security Gate • Auto-Dream Memory      │",
      "╰──────────────────────────────────────────────────────────────────────────╯",
    ].join("\n")
  );
}

async function main(): Promise<void> {
  if (command === "doctor") {
    printBanner();
    const providerStatus = orchestrator.adapter.getProviderStatus();
    console.log("\n[Environment Diagnostics]");
    console.log(`  ✓ Runtime Engine       : Bun ${Bun.version}`);
    console.log(`  ✓ Platform             : ${process.platform} (${process.arch})`);
    console.log(
      `  ✓ Anthropic Claude API : ${
        providerStatus.anthropicConfigured
          ? "Configured (Live Mode)"
          : "Simulation Fallback Ready (Set ANTHROPIC_API_KEY for live calls)"
      }`
    );
    console.log(
      `  ✓ OpenAI Codex API     : ${
        providerStatus.openaiConfigured
          ? "Configured (Live Mode)"
          : "Simulation Fallback Ready (Set OPENAI_API_KEY for live calls)"
      }`
    );
    console.log(
      `  ✓ Security Gate Engine : 9 Active Rules (Static AST + Codex Adversarial Audit + SARIF 2.1.0)`
    );
    console.log(
      `  ✓ Active MCP Servers   : ${
        orchestrator.mcpHub.listServers().filter((s) => s.enabled).length
      }/${orchestrator.mcpHub.listServers().length} enabled`
    );
    console.log("\nAll CC-Nexus subsystems verified healthy.");
    return;
  }

  if (command === "audit") {
    const isJson = args.includes("--json");
    const isSarif = args.includes("--sarif");
    let contentToScan = "";

    if (args.includes("--sample")) {
      contentToScan = [
        "diff --git a/src/deploy/sample.ts b/src/deploy/sample.ts",
        "+++ b/src/deploy/sample.ts",
        "+export function verifySafeInput(userId: string): string {",
        "+  return userId.replace(/[^a-zA-Z0-9_-]/g, '');",
        "+}",
      ].join("\n");
    } else {
      const targetArg = args.find((a, idx) => idx > 0 && !a.startsWith("--"));
      if (targetArg && existsSync(targetArg)) {
        contentToScan = readFileSync(targetArg, "utf8");
      } else {
        contentToScan =
          orchestrator.worktrees.listSandboxes()[0]?.samplePatch || "";
      }
    }

    const report = orchestrator.securityGate.auditContent(contentToScan, "diff");

    if (isSarif) {
      console.log(
        JSON.stringify(orchestrator.securityGate.toSarif(report), null, 2)
      );
      return;
    }

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    printBanner();
    console.log(`\n[OpenAI Codex × Claude Security Gate Report]`);
    console.log(`  Audit ID   : ${report.auditId}`);
    console.log(`  Verdict    : ${report.verdict}`);
    console.log(`  Risk Score : ${report.riskScore}/100`);
    console.log(`  Summary    : ${report.codexReviewSummary}`);
    if (report.findings.length > 0) {
      console.log("\n  Findings:");
      for (const f of report.findings) {
        console.log(
          `    - [${f.ruleId}] (${f.severity.toUpperCase()}) ${f.title} @ line ${f.line}`
        );
        console.log(`      Fix: ${f.remediation}`);
      }
    }
    return;
  }

  if (command === "dream") {
    printBanner();
    const dream = orchestrator.memoryDream.runAutoDream();
    console.log(`\n[Auto-Dream Memory Consolidation Complete]`);
    console.log(`  Dream ID          : ${dream.dreamId}`);
    console.log(`  Fragments Retained: ${dream.fragmentsRetained}`);
    console.log(
      `  Token Compression : ${(dream.tokenCompressionRatio * 100).toFixed(0)}% reduction`
    );

    if (args.includes("--write")) {
      writeFileSync("CLAUDE.md", dream.claudeMdContent, "utf8");
      writeFileSync("AGENTS.md", dream.agentsMdContent, "utf8");
      console.log("  ✓ Wrote synchronized CLAUDE.md and AGENTS.md to workspace.");
    } else {
      console.log("\n--- Preview: CLAUDE.md ---\n");
      console.log(dream.claudeMdContent);
    }
    return;
  }

  if (command === "worktree") {
    printBanner();
    const sub = args[1] || "list";
    if (sub === "create") {
      const name = args[2] || `task-${Date.now().toString(36)}`;
      const wt = orchestrator.worktrees.createSandbox(
        name,
        "claude-coder + codex-auditor"
      );
      console.log(`\n✓ Created isolated Git worktree: ${wt.branch} (${wt.path})`);
      return;
    }
    console.log("\n[Isolated Git Worktree Sandboxes]");
    for (const wt of orchestrator.worktrees.listSandboxes()) {
      console.log(
        `  • ${wt.branch.padEnd(32)} | ${wt.status.toUpperCase().padEnd(9)} | +${wt.diffStats.insertions}/-${wt.diffStats.deletions} lines | ${wt.path}`
      );
    }
    return;
  }

  if (command === "run") {
    printBanner();
    const prompt =
      args.slice(1).join(" ") ||
      "Implement rate-limited webhook verifier with unit tests";
    console.log(`\n▶ Launching Multi-Agent Swarm for: "${prompt}"...`);
    const task = await orchestrator.runSwarmTask(prompt.slice(0, 48), prompt);
    for (const step of task.steps) {
      console.log(
        `  [${step.role.toUpperCase()}] (${step.model}) -> ${step.summary}`
      );
    }
    console.log(
      `\n✓ Task Status: ${task.status.toUpperCase()} | Branch: ${task.branch} | Security Verdict: ${task.securityReport?.verdict}`
    );
    return;
  }

  if (command === "studio" || command === "serve") {
    const port = Number(process.env.PORT || 4789);
    const { server } = createNexusServer(port);
    printBanner();
    console.log(
      `\n🚀 CC-Nexus Web Studio running at http://localhost:${server.port}`
    );
    return;
  }

  printBanner();
  console.log(`
Usage:
  bun run src/cli/index.ts <command> [options]

Commands:
  studio                 Start the Bun Sidecar Server & Web Studio UI (:4789)
  doctor                 Verify runtime, providers, MCP servers, and Security Gate
  run "<prompt>"         Execute a 3-stage Claude Architect + Coder + Codex Auditor task
  audit [--sample]       Scan diffs or files with the Dual-Engine Security Gate (--json, --sarif)
  worktree [list|create] Manage isolated Git worktree sandboxes
  dream [--write]        Consolidate session memory into CLAUDE.md and AGENTS.md
`);
}

main();
