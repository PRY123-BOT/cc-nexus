export type ModelProvider = "anthropic" | "openai" | "simulation";

export type PersonaMode = "beginner" | "office" | "developer";

export type AgentRole =
  | "super-router"
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
    | "supply-chain"
    | "privacy-pii";
  line?: number;
  file?: string;
  snippet: string;
  remediation: string;
  detectedBy: "static-ast" | "openai-codex" | "claude-guard";
}

export interface SecurityAuditReport {
  auditId: string;
  timestamp: string;
  targetType: "diff" | "command" | "file" | "document";
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
  phase: "route" | "plan" | "implement" | "audit" | "consolidate";
  summary: string;
  detail: string;
  tokensIn: number;
  tokensOut: number;
  cachedTokens: number;
  costUsd: number;
  durationMs: number;
}

export interface TaskDeliverable {
  format: "markdown-doc" | "action-checklist" | "privacy-audit" | "code-diff";
  title: string;
  subtitle: string;
  markdownBody: string;
  safetyNotePlain: string;
  exportFilename: string;
}

export interface SwarmTask {
  id: string;
  persona: PersonaMode;
  title: string;
  prompt: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  worktreeId: string;
  branch: string;
  workerId?: string;
  routerTicketId?: string;
  steps: AgentStepLog[];
  securityReport?: SecurityAuditReport;
  generatedPatch: string;
  deliverable?: TaskDeliverable;
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

export type EventSourceChannel =
  | "github-webhook"
  | "feishu-im"
  | "ci-pipeline"
  | "cli-direct"
  | "watchdog-daemon";

export interface RawInboundEvent {
  id: string;
  channel: EventSourceChannel;
  sender: string;
  subject: string;
  payload: string;
  timestamp: string;
}

export interface FilteredEventRecord {
  event: RawInboundEvent;
  filterOutcome: "DROPPED_NOISE" | "ROUTED_TO_WORKER";
  filterRuleId: string;
  reason: string;
  tokensSavedEstimate: number;
  routedTicketId?: string;
}

export interface RouterTicket {
  ticketId: string;
  sourceEventId: string;
  intentCategory: "feature" | "security-hotfix" | "refactor" | "ci-repair" | "office-doc" | "beginner-assist";
  priority: "P0" | "P1" | "P2";
  assignedWorkerId: string;
  worktreeBranch: string;
  routerConstraintVerified: boolean;
  dispatchedAt: string;
}

export interface WorkerNode {
  workerId: string;
  ticketId: string;
  taskId: string;
  persona: PersonaMode;
  title: string;
  worktreeBranch: string;
  status: "running" | "completed_silent" | "escalated_inbox" | "healed_by_watchdog";
  heartbeatLatencyMs: number;
  toolCallsCount: number;
  loopDetected: boolean;
  tokenBudgetUsedPct: number;
  updatedAt: string;
}

export interface WatchdogIncident {
  incidentId: string;
  workerId: string;
  anomalyType: "infinite-tool-loop" | "heartbeat-stall" | "token-runaway";
  signature: string;
  actionTaken: "auto-healed-reset" | "escalated-to-human";
  timestamp: string;
  detail: string;
}

export interface AttentionInboxItem {
  inboxId: string;
  taskId: string;
  workerId: string;
  persona: PersonaMode;
  category: "security-gate-block" | "watchdog-anomaly" | "architecture-signoff" | "privacy-redaction";
  severity: "critical" | "high" | "normal";
  title: string;
  summary: string;
  branch: string;
  riskScore: number;
  createdAt: string;
  resolved: boolean;
  resolution?: "approved" | "rejected";
}

export interface SuperAgentTelemetry {
  attentionSlotsUsed: number;
  attentionSlotsMax: number;
  totalEventsIngested: number;
  noiseEventsDropped: number;
  noiseFilterRatioPct: number;
  tokensSavedByFilter: number;
  silentCompletionsCount: number;
  routerDirectExecViolations: number;
}
