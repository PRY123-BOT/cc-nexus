# AGENTS.md — OpenAI Codex & Multi-Agent Instructions

> Synchronized with `CLAUDE.md` by **CC-Nexus Auto-Dream Engine** for OpenAI Codex & Responses API agents.

## Role & Verification Contract
- **Primary Implementation Engine**: Anthropic Claude Code (`claude-architect`, `claude-coder`)
- **Adversarial Security & PR Verification Engine**: OpenAI Codex (`codex-auditor`)
- **Merge Policy**: No branch may be merged from `.cc-nexus/worktrees/*` unless `SecurityGate` returns `PASS` or an explicit human approval token.

## Consolidated Engineering Rules
1. **[ARCHITECTURE] Worktree Isolation per Autonomous Task**: Every multi-agent coding task must execute inside an isolated Git worktree (.cc-nexus/worktrees/<task-id>) before merging into the main branch.
2. **[SECURITY-RULE] Dual-Engine Adversarial Diff Verification**: All patches authored by Claude Code must pass the OpenAI Codex Security Gate (riskScore < 50, zero hardcoded sk-ant-* or sk-proj-* secrets) prior to commit.
3. **[PITFALL] Avoid Shell String Interpolation in Subprocesses**: Never pass unsanitized template strings to child_process.exec; always pass argument arrays to Bun.spawn or execFile.
4. **[CONVENTION] Strict TypeScript & Zero Implicit Any**: Use strict ESM TypeScript imports with explicit return types on public classes and deterministic unit tests powered by bun:test.
