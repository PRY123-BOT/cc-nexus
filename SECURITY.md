# Security Policy & Autonomous Agent Guardrails

`cc-nexus` is built from the ground up as a **security-first orchestration harness** for autonomous coding agents (**Anthropic Claude Code** and **OpenAI Codex**).

## Supported Versions

| Version | Supported          | Security Gate Engine |
| ------- | ------------------ | -------------------- |
| 1.0.x   | :white_check_mark: | Dual-Engine (Static AST/Regex + OpenAI Codex Adversarial Audit) |

## Built-In Security Guarantees

1. **Zero Leaked/Proprietary Code (Clean-Room Architecture)**
   - Unlike legacy community forks, `cc-nexus` is 100% original TypeScript built cleanly on standard APIs (`@anthropic-ai/sdk` / REST, OpenAI `Responses API`, Model Context Protocol, and native Git Worktrees).
2. **Pre-Execution Shell & Diff Guardrails (`SecurityGate`)**
   - Every shell command and unified diff proposed by an autonomous agent is inspected before execution or branch merge:
     - **Secret & Token Leak Prevention**: Detects hardcoded Anthropic (`sk-ant-*`), OpenAI (`sk-proj-*`), AWS (`AKIA*`), GitHub (`ghp_*`), and PEM private keys.
     - **Destructive Command Blocking**: Blocks recursive root deletions, raw disk formatting, unauthorized credential exfiltration (`curl | sh`), and `.git/config` tampering.
     - **Adversarial Cross-Model Review**: Uses OpenAI Codex to independently audit patches authored by Claude Code (and vice-versa) for injection flaws, path traversal, and logic bugs.
3. **Git Worktree Sandbox Isolation**
   - Every multi-agent task runs in an isolated `.cc-nexus/worktrees/<task-id>` branch so experimental agent actions never corrupt the developer's main working tree.

## Reporting a Vulnerability

If you discover a security vulnerability in `cc-nexus`, please report it responsibly:

- **GitHub Security Advisories**: Open a private advisory under the repository's **Security** tab.
- **Automated Scanning**: This repository is designed for integration with **OpenAI Codex Security** and **Anthropic OSS Scanner** for continuous vulnerability detection.
- **Response SLA**: Critical vulnerabilities affecting sandbox isolation or remote webhook authentication are triaged within 24 hours.
