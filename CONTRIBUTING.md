# Contributing to CC-Nexus

Thank you for your interest in contributing to **CC-Nexus (Claude-Codex Nexus Studio)**! We welcome contributions from developers building across the **Claude Code**, **OpenAI Codex**, and **Model Context Protocol (MCP)** ecosystems.

## Development Quickstart

### Prerequisites
- **Bun** `>= 1.1.0` (recommended runtime and test runner)
- **Git** `>= 2.30+` (with `git worktree` support)
- **Node.js** `>= 20.0.0` (optional compatibility layer)

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/PRY123-BOT/cc-nexus.git
cd cc-nexus

# 2. Run environment diagnostics
bun run doctor

# 3. Run the automated test suite
bun test

# 4. Start the Sidecar + Web Studio on http://localhost:4789
bun run start
```

## Architecture Guidelines

- **`src/core/`**: Keep core modules deterministic, pure TypeScript, and free of heavy UI dependencies so they can be used both by the CLI and the Sidecar server.
  - `types.ts`: Shared interfaces and domain contracts.
  - `security-gate.ts`: Static + adversarial cross-model security scanner.
  - `worktree.ts`: Git worktree sandbox lifecycle and unified diff parser.
  - `memory-dream.ts`: Auto-Dream context consolidation into `CLAUDE.md` and `AGENTS.md`.
  - `mcp-hub.ts`: Model Context Protocol server registry and diagnostics.
  - `orchestrator.ts`: Multi-agent DAG execution (`Architect -> Coder -> Codex Auditor`).
- **`src/providers/`**: Model adapters for Anthropic Claude (`Messages API` / CLI) and OpenAI Codex (`Responses API` / Chat Completions), plus a deterministic zero-key simulation engine for CI and offline testing.
- **`src/server/`**: Bun HTTP + WebSocket sidecar server.
- **`src/ui/`**: Self-contained Web Studio dashboard.
- **`src/cli/`**: Terminal command-line interface.

## Pull Request Checklist

1. Ensure all tests pass via `bun test`.
2. Run the security gate on your own diff via `bun run src/cli/index.ts audit`.
3. Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `security:`, `test:`).
