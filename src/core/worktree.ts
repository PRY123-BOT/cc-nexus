import type { DiffFileStat, WorktreeSandbox } from "./types.ts";

export class WorktreeManager {
  private sandboxes: Map<string, WorktreeSandbox> = new Map();

  constructor() {
    this.seedInitialSandboxes();
  }

  /**
   * Parses any unified git diff string into file-level addition/deletion statistics.
   */
  public parseUnifiedDiff(patch: string): {
    filesChanged: number;
    insertions: number;
    deletions: number;
    files: DiffFileStat[];
  } {
    const files: Map<string, DiffFileStat> = new Map();
    let currentFile = "";
    let totalInsertions = 0;
    let totalDeletions = 0;

    for (const line of patch.split(/\r?\n/)) {
      if (line.startsWith("+++ b/")) {
        currentFile = line.slice(6).trim();
        if (!files.has(currentFile)) {
          files.set(currentFile, {
            path: currentFile,
            additions: 0,
            deletions: 0,
            status: "modified",
          });
        }
        continue;
      }
      if (line.startsWith("--- /dev/null") && currentFile) {
        const entry = files.get(currentFile);
        if (entry) entry.status = "added";
        continue;
      }
      if (!currentFile) continue;

      if (line.startsWith("+") && !line.startsWith("+++")) {
        const entry = files.get(currentFile);
        if (entry) entry.additions += 1;
        totalInsertions += 1;
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        const entry = files.get(currentFile);
        if (entry) entry.deletions += 1;
        totalDeletions += 1;
      }
    }

    const fileList = Array.from(files.values());
    return {
      filesChanged: fileList.length,
      insertions: totalInsertions,
      deletions: totalDeletions,
      files: fileList,
    };
  }

  public createSandbox(
    taskId: string,
    agentAssigned: string,
    samplePatch?: string
  ): WorktreeSandbox {
    const cleanSlug = taskId.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
    const id = `wt-${cleanSlug}`;
    const branch = `nexus/${cleanSlug}`;
    const patch =
      samplePatch ||
      [
        "diff --git a/src/auth/token-verifier.ts b/src/auth/token-verifier.ts",
        "index 41a8b91..9f82d14 100644",
        "--- a/src/auth/token-verifier.ts",
        "+++ b/src/auth/token-verifier.ts",
        "@@ -12,7 +12,11 @@ export async function verifySessionToken(rawToken: string) {",
        "-  const payload = JSON.parse(Buffer.from(rawToken, 'base64').toString());",
        "+  if (!rawToken || rawToken.length > 2048) {",
        "+    throw new Error('Invalid token envelope length');",
        "+  }",
        "+  const payload = await verifyHmacSignature(rawToken, process.env.SESSION_SECRET!);",
        "   return payload;",
        " }",
      ].join("\n");

    const diffStats = this.parseUnifiedDiff(patch);
    const sandbox: WorktreeSandbox = {
      id,
      taskId,
      branch,
      path: `.cc-nexus/worktrees/${cleanSlug}`,
      baseCommit: "a94f2c1",
      status: "isolated",
      createdAt: new Date().toISOString(),
      agentAssigned,
      diffStats,
      samplePatch: patch,
    };

    this.sandboxes.set(id, sandbox);
    return sandbox;
  }

  public listSandboxes(): WorktreeSandbox[] {
    return Array.from(this.sandboxes.values());
  }

  public getSandbox(id: string): WorktreeSandbox | undefined {
    return this.sandboxes.get(id);
  }

  public updateSandboxStatus(
    id: string,
    status: WorktreeSandbox["status"]
  ): WorktreeSandbox | undefined {
    const existing = this.sandboxes.get(id);
    if (!existing) return undefined;
    existing.status = status;
    return existing;
  }

  private seedInitialSandboxes(): void {
    this.createSandbox(
      "task-jwt-hardening",
      "claude-coder + codex-auditor",
      [
        "diff --git a/src/security/jwt-guard.ts b/src/security/jwt-guard.ts",
        "--- a/src/security/jwt-guard.ts",
        "+++ b/src/security/jwt-guard.ts",
        "@@ -8,5 +8,12 @@ export function validateBearerHeader(header?: string): string {",
        "-  return header ? header.replace('Bearer ', '') : '';",
        "+  if (!header || !header.startsWith('Bearer ')) {",
        "+    throw new Error('Missing or malformed Authorization Bearer header');",
        "+  }",
        "+  const token = header.slice(7).trim();",
        "+  if (token.split('.').length !== 3) {",
        "+    throw new Error('Invalid JWT compact serialization structure');",
        "+  }",
        "+  return token;",
        " }",
        "diff --git a/tests/jwt-guard.spec.ts b/tests/jwt-guard.spec.ts",
        "--- /dev/null",
        "+++ b/tests/jwt-guard.spec.ts",
        "@@ -0,0 +1,8 @@",
        "+import { describe, it, expect } from 'bun:test';",
        "+import { validateBearerHeader } from '../src/security/jwt-guard';",
        "+",
        "+describe('validateBearerHeader', () => {",
        "+  it('rejects malformed JWT segments', () => {",
        "+    expect(() => validateBearerHeader('Bearer bad-token')).toThrow();",
        "+  });",
        "+});",
      ].join("\n")
    );

    this.createSandbox(
      "task-mcp-rate-limiter",
      "claude-architect + claude-coder",
      [
        "diff --git a/src/mcp/rate-limiter.ts b/src/mcp/rate-limiter.ts",
        "--- a/src/mcp/rate-limiter.ts",
        "+++ b/src/mcp/rate-limiter.ts",
        "@@ -1,4 +1,14 @@",
        "+export class TokenBucketLimiter {",
        "+  private tokens: number;",
        "+  constructor(private capacity = 60, private refillPerSec = 10) {",
        "+    this.tokens = capacity;",
        "+  }",
        "+  public consume(count = 1): boolean {",
        "+    if (this.tokens < count) return false;",
        "+    this.tokens -= count;",
        "+    return true;",
        "+  }",
        "+}",
      ].join("\n")
    );
  }
}
