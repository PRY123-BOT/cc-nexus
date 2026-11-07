import type { MCPServerEntry } from "./types.ts";

export class MCPHubManager {
  private servers: MCPServerEntry[] = [
    {
      id: "mcp-filesystem",
      name: "Filesystem Sandbox Server",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "./"],
      envKeys: [],
      category: "filesystem",
      enabled: true,
      healthy: true,
      description: "Scoped read/write file operations confined to the active Git worktree.",
      toolsCount: 11,
    },
    {
      id: "mcp-git-worktree",
      name: "CC-Nexus Git & Worktree MCP",
      command: "bun",
      args: ["run", "src/cli/index.ts", "worktree", "list"],
      envKeys: [],
      category: "git",
      enabled: true,
      healthy: true,
      description: "Branch isolation, unified diff capture, and worktree lifecycle management.",
      toolsCount: 6,
    },
    {
      id: "mcp-codex-security",
      name: "OpenAI Codex Security Auditor MCP",
      command: "bun",
      args: ["run", "src/cli/index.ts", "audit", "--sample"],
      envKeys: ["OPENAI_API_KEY"],
      category: "security",
      enabled: true,
      healthy: true,
      description: "Adversarial patch auditing, secret scanning, and SARIF 2.1.0 vulnerability reporting.",
      toolsCount: 5,
    },
    {
      id: "mcp-github",
      name: "GitHub Repository & PR Triage MCP",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      envKeys: ["GITHUB_PERSONAL_ACCESS_TOKEN"],
      category: "git",
      enabled: true,
      healthy: true,
      description: "Automated issue triage, PR review comments, and release notes generation.",
      toolsCount: 14,
    },
    {
      id: "mcp-playwright",
      name: "Playwright Browser Verification MCP",
      command: "npx",
      args: ["-y", "@playwright/mcp@latest"],
      envKeys: [],
      category: "browser",
      enabled: false,
      healthy: true,
      description: "Headless browser automation for visual regression and DOM verification.",
      toolsCount: 18,
    },
  ];

  public listServers(): MCPServerEntry[] {
    return [...this.servers];
  }

  public toggleServer(id: string): MCPServerEntry | undefined {
    const target = this.servers.find((s) => s.id === id);
    if (!target) return undefined;
    target.enabled = !target.enabled;
    return target;
  }

  /**
   * Generates a standard `.mcp.json` configuration compatible with Claude Code (`~/.claude.json`).
   */
  public exportClaudeMcpConfig(): Record<string, unknown> {
    const mcpServers: Record<string, unknown> = {};
    for (const s of this.servers.filter((item) => item.enabled)) {
      mcpServers[s.id] = {
        command: s.command,
        args: s.args,
        env: Object.fromEntries(s.envKeys.map((k) => [k, `\${${k}}`])),
      };
    }
    return { mcpServers };
  }
}
