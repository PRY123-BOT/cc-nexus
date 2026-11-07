export type ModelProvider = "anthropic" | "openai" | "simulation";

export type AgentRole =
  | "claude-architect"
  | "claude-coder"
  | "codex-auditor"
  | "memory-dreamer";

export type TaskStatus =
  | "queued"
  | "planning"
  | "coding"
  | "auditing"
  | "awaiting_approval"
  | "completed"
  | "blocked";

export type SecuritySeverity = "critical" | "high" | "medium" | "low" | "info";

export type SecurityVerdict = "PASS" | "WARN" | "BLOCK";

export interface SecurityFinding {
  id: string;
  ruleId: string;
  title: string;
  severity: SecuritySeverity;
  category:
    | "secret-leak"
    | "destructive-command"
    | "code-injection"
    | "path-traversal"
    | "unsafe-eval"
    | "sql-injection"
    | "supply-chain";
  line?: number;
  file?: string;
  snippet: string;
  remediation: string;
  detectedBy: "static-ast" | "openai-codex" | "claude-guard";
}

export interface SecurityAuditReport {
  auditId: string;
  timestamp: string;
  targetType: "diff" | "command" | "file";
  riskScore: number; // 0 (safe) to 100 (critical danger)
  verdict: SecurityVerdict;
  findings: SecurityFinding[];
  codexReviewSummary: string;
  executionAllowed: boolean;
}

export interface DiffFileStat {
  path: string;
  additions: number;
  deletions: number;
  status: "added" | "modified" | "deleted";
}

export interface WorktreeSandbox {
  id: string;
  taskId: string;
  branch: string;
  path: string;
  baseCommit: string;
  status: "active" | "merged" | "discarded" | "isolated";
  createdAt: string;
  agentAssigned: string;
  diffStats: {
    filesChanged: number;
    insertions: number;
    deletions: number;
    files: DiffFileStat[];
  };
  samplePatch: string;
}

export interface AgentStepLog {
  id: string;
  timestamp: string;
  role: AgentRole;
  model: string;
  provider: ModelProvider;
  phase: "plan" | "implement" | "audit" | "consolidate";
  summary: string;
  detail: string;
  tokensIn: number;
  tokensOut: number;
  cachedTokens: number;
  costUsd: number;
  durationMs: number;
}

export interface SwarmTask {
  id: string;
  title: string;
  prompt: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  worktreeId: string;
  branch: string;
  steps: AgentStepLog[];
  securityReport?: SecurityAuditReport;
  generatedPatch: string;
  pendingApproval?: {
    approvalId: string;
    action: string;
    commandOrFile: string;
    reason: string;
    requestedAt: string;
  };
}

export interface MemoryFragment {
  id: string;
  category: "architecture" | "convention" | "security-rule" | "pitfall";
  title: string;
  content: string;
  confidence: number;
  sourceTaskId: string;
  updatedAt: string;
}

export interface DreamConsolidationResult {
  dreamId: string;
  timestamp: string;
  fragmentsProcessed: number;
  fragmentsRetained: number;
  tokenCompressionRatio: number;
  claudeMdContent: string;
  agentsMdContent: string;
  fragments: MemoryFragment[];
}

export interface MCPServerEntry {
  id: string;
  name: string;
  command: string;
  args: string[];
  envKeys: string[];
  category: "filesystem" | "git" | "database" | "browser" | "search" | "security";
  enabled: boolean;
  healthy: boolean;
  description: string;
  toolsCount: number;
}

export interface FinOpsSummary {
  totalTasks: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCachedTokens: number;
  totalCostUsd: number;
  estimatedCacheSavingsUsd: number;
  byModel: Record<
    string,
    {
      calls: number;
      tokensIn: number;
      tokensOut: number;
      cachedTokens: number;
      costUsd: number;
    }
  >;
}
