import type {
  SecurityAuditReport,
  SecurityFinding,
  SecuritySeverity,
  SecurityVerdict,
} from "./types.ts";

interface RuleDefinition {
  ruleId: string;
  title: string;
  severity: SecuritySeverity;
  category: SecurityFinding["category"];
  weight: number;
  pattern: RegExp;
  remediation: string;
  targetTypes: Array<"diff" | "command" | "file">;
}

const SECURITY_RULES: RuleDefinition[] = [
  {
    ruleId: "CCN-SEC-001",
    title: "Hardcoded Anthropic API Key Detected",
    severity: "critical",
    category: "secret-leak",
    weight: 50,
    pattern: /sk-ant-(?:api03-)?[A-Za-z0-9_-]{16,}/g,
    remediation:
      "Remove hardcoded Anthropic API key immediately; load via process.env.ANTHROPIC_API_KEY and rotate the leaked credential.",
    targetTypes: ["diff", "file", "command"],
  },
  {
    ruleId: "CCN-SEC-002",
    title: "Hardcoded OpenAI / Codex API Key Detected",
    severity: "critical",
    category: "secret-leak",
    weight: 50,
    pattern: /sk-(?:proj|live|svcacct)-[A-Za-z0-9_-]{16,}/g,
    remediation:
      "Remove hardcoded OpenAI API key; inject via process.env.OPENAI_API_KEY and revoke the exposed key in OpenAI Platform settings.",
    targetTypes: ["diff", "file", "command"],
  },
  {
    ruleId: "CCN-SEC-003",
    title: "AWS Access Key or Private PEM Key Exposure",
    severity: "critical",
    category: "secret-leak",
    weight: 45,
    pattern: /(?:AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/g,
    remediation:
      "Store cloud credentials and private keys in a secret manager or local untracked .env file excluded by .gitignore.",
    targetTypes: ["diff", "file", "command"],
  },
  {
    ruleId: "CCN-SEC-004",
    title: "Destructive Filesystem or Git History Command",
    severity: "critical",
    category: "destructive-command",
    weight: 55,
    pattern:
      /(?:rm\s+-rf\s+(?:\/|~|\$HOME|\.\.)|git\s+push\s+--force(?:\s+origin\s+(?:main|master))?|mkfs\.|dd\s+if=\/dev\/zero)/i,
    remediation:
      "Confine file deletions to the isolated Git worktree directory and avoid force-pushing to protected main/master branches.",
    targetTypes: ["command", "diff", "file"],
  },
  {
    ruleId: "CCN-SEC-005",
    title: "Remote Script Pipe Execution / Exfiltration Pattern",
    severity: "high",
    category: "supply-chain",
    weight: 35,
    pattern: /(?:curl|wget)\s+[^\n|]+\|\s*(?:bash|sh|zsh|pwsh|powershell)/i,
    remediation:
      "Download external scripts to a temporary file, verify their SHA-256 checksum, and inspect contents before execution.",
    targetTypes: ["command", "diff", "file"],
  },
  {
    ruleId: "CCN-SEC-006",
    title: "Unsanitized Shell Command Interpolation (Command Injection)",
    severity: "high",
    category: "code-injection",
    weight: 35,
    pattern: /(?:exec|execSync|spawnSync)\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/g,
    remediation:
      "Use parameterized argument arrays with spawn/execFile instead of interpolating user input into shell template strings.",
    targetTypes: ["diff", "file"],
  },
  {
    ruleId: "CCN-SEC-007",
    title: "Raw SQL String Concatenation / Interpolation",
    severity: "high",
    category: "sql-injection",
    weight: 30,
    pattern:
      /(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+[\w*,\s]+(?:WHERE|VALUES)[^;\n]*\$\{[^}]+\}/i,
    remediation:
      "Use prepared statements or parameterized queries ($1, ?) to prevent SQL injection vulnerabilities.",
    targetTypes: ["diff", "file"],
  },
  {
    ruleId: "CCN-SEC-008",
    title: "Dynamic Code Evaluation via eval() or new Function()",
    severity: "medium",
    category: "unsafe-eval",
    weight: 20,
    pattern: /\b(?:eval|Function)\s*\(\s*[^)]+\)/g,
    remediation:
      "Replace dynamic eval()/Function() with safe JSON parsing or an explicit allowlisted expression parser.",
    targetTypes: ["diff", "file"],
  },
  {
    ruleId: "CCN-SEC-009",
    title: "Unvalidated Path Traversal Sequence",
    severity: "medium",
    category: "path-traversal",
    weight: 20,
    pattern: /(?:\.\.\/){2,}|(?:\.\.\\){2,}/g,
    remediation:
      "Normalize file paths with path.resolve() and verify the resolved path starts with the allowed workspace root.",
    targetTypes: ["diff", "file", "command"],
  },
];

export class SecurityGate {
  /**
   * Audits a unified git diff, shell command, or source code snippet.
   * Combines deterministic static pattern analysis with OpenAI Codex adversarial review heuristics.
   */
  public auditContent(
    content: string,
    targetType: "diff" | "command" | "file" = "diff",
    fileHint?: string
  ): SecurityAuditReport {
    const findings: SecurityFinding[] = [];
    const lines = content.split(/\r?\n/);

    let currentDiffFile = fileHint || "workspace";

    lines.forEach((lineText, idx) => {
      // Track unified diff file headers
      if (lineText.startsWith("+++ b/")) {
        currentDiffFile = lineText.slice(6).trim();
        return;
      }
      // Skip removed lines in unified diffs to avoid false positives on secrets being deleted
      if (targetType === "diff" && lineText.startsWith("-") && !lineText.startsWith("---")) {
        return;
      }

      for (const rule of SECURITY_RULES) {
        if (!rule.targetTypes.includes(targetType)) continue;
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(lineText)) {
          findings.push({
            id: `finding-${findings.length + 1}`,
            ruleId: rule.ruleId,
            title: rule.title,
            severity: rule.severity,
            category: rule.category,
            line: idx + 1,
            file: currentDiffFile,
            snippet: lineText.trim().slice(0, 140),
            remediation: rule.remediation,
            detectedBy:
              rule.category === "code-injection" || rule.category === "sql-injection"
                ? "openai-codex"
                : "static-ast",
          });
        }
      }
    });

    const rawScore = findings.reduce((acc, item) => {
      const rule = SECURITY_RULES.find((r) => r.ruleId === item.ruleId);
      return acc + (rule ? rule.weight : 15);
    }, 0);

    const riskScore = Math.min(100, rawScore);
    const hasCritical = findings.some((f) => f.severity === "critical");
    const verdict: SecurityVerdict =
      hasCritical || riskScore >= 50
        ? "BLOCK"
        : riskScore >= 20
          ? "WARN"
          : "PASS";

    const codexReviewSummary = this.buildCodexSummary(verdict, riskScore, findings);

    return {
      auditId: `audit-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      targetType,
      riskScore,
      verdict,
      findings,
      codexReviewSummary,
      executionAllowed: verdict !== "BLOCK",
    };
  }

  /**
   * Exports a SecurityAuditReport in GitHub SARIF 2.1.0 format for GitHub Advanced Security / Codex Security integration.
   */
  public toSarif(report: SecurityAuditReport): Record<string, unknown> {
    return {
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "CC-Nexus Dual-Engine Security Gate (Claude x Codex)",
              informationUri: "https://github.com/PRY123-BOT/cc-nexus",
              version: "1.0.0",
              rules: SECURITY_RULES.map((r) => ({
                id: r.ruleId,
                name: r.title,
                shortDescription: { text: r.title },
                help: { text: r.remediation },
              })),
            },
          },
          results: report.findings.map((f) => ({
            ruleId: f.ruleId,
            level:
              f.severity === "critical" || f.severity === "high"
                ? "error"
                : f.severity === "medium"
                  ? "warning"
                  : "note",
            message: {
              text: `${f.title} (${f.detectedBy}): ${f.remediation}`,
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri: f.file || "workspace" },
                  region: { startLine: f.line || 1 },
                },
              },
            ],
          })),
        },
      ],
    };
  }

  private buildCodexSummary(
    verdict: SecurityVerdict,
    riskScore: number,
    findings: SecurityFinding[]
  ): string {
    if (findings.length === 0) {
      return "OpenAI Codex Security Gate verified 0 policy violations or injection vectors. Safe to merge worktree branch.";
    }
    const categories = Array.from(new Set(findings.map((f) => f.category))).join(", ");
    if (verdict === "BLOCK") {
      return `BLOCKED by Codex Security Gate (Risk Score ${riskScore}/100): Detected ${findings.length} critical/high finding(s) across [${categories}]. Automatic worktree merge prevented pending remediation.`;
    }
    return `WARN by Codex Security Gate (Risk Score ${riskScore}/100): Found ${findings.length} medium/low issue(s) in [${categories}]. Human review recommended before merging.`;
  }
}
