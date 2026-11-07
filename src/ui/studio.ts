export function renderStudioHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CC-Nexus Studio — Claude Code × OpenAI Codex Multi-Agent Control Plane</title>
  <style>
    :root {
      --bg-base: #07090e;
      --bg-panel: #0e131f;
      --bg-card: #141b2d;
      --bg-elevated: #1b253d;
      --border: rgba(148, 163, 184, 0.14);
      --border-highlight: rgba(99, 102, 241, 0.45);
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --claude-amber: #f59e0b;
      --claude-glow: rgba(245, 158, 11, 0.18);
      --codex-emerald: #10b981;
      --codex-glow: rgba(16, 185, 129, 0.18);
      --accent-indigo: #6366f1;
      --danger-rose: #f43f5e;
      --warn-amber: #fbbf24;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 12% 0%, rgba(99, 102, 241, 0.14), transparent 38%),
                  radial-gradient(circle at 88% 8%, rgba(16, 185, 129, 0.12), transparent 36%),
                  var(--bg-base);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      line-height: 1.5;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 28px;
      background: rgba(14, 19, 31, 0.88);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 30;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b 0%, #6366f1 52%, #10b981 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      color: #fff;
      box-shadow: 0 0 22px rgba(99, 102, 241, 0.45);
    }
    .brand-title h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-title p {
      font-size: 12px;
      color: var(--text-muted);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid var(--border);
    }
    .badge-claude { background: var(--claude-glow); color: #fbbf24; border-color: rgba(245, 158, 11, 0.35); }
    .badge-codex { background: var(--codex-glow); color: #34d399; border-color: rgba(16, 185, 129, 0.35); }
    .badge-pass { background: rgba(16, 185, 129, 0.16); color: #34d399; border-color: rgba(16, 185, 129, 0.4); }
    .badge-warn { background: rgba(251, 191, 36, 0.16); color: #fbbf24; border-color: rgba(251, 191, 36, 0.4); }
    .badge-block { background: rgba(244, 63, 94, 0.18); color: #fb7185; border-color: rgba(244, 63, 94, 0.45); }
    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn {
      background: var(--bg-elevated);
      color: var(--text-main);
      border: 1px solid var(--border);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }
    .btn:hover { border-color: var(--border-highlight); background: #23304f; }
    .btn-primary {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      border-color: rgba(129, 140, 248, 0.5);
      color: #fff;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }
    .btn-primary:hover { background: linear-gradient(135deg, #4338ca, #4f46e5); }
    .btn-success {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.5);
      color: #34d399;
    }
    .btn-danger {
      background: rgba(244, 63, 94, 0.2);
      border-color: rgba(244, 63, 94, 0.5);
      color: #fb7185;
    }
    .container {
      max-width: 1480px;
      margin: 0 auto;
      padding: 22px 28px 48px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-bottom: 22px;
    }
    .kpi-card {
      background: rgba(20, 27, 45, 0.85);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 18px;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #f59e0b, #6366f1, #10b981);
      opacity: 0.75;
    }
    .kpi-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      font-family: var(--font-mono);
    }
    .kpi-sub {
      font-size: 11.5px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .nav-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .tab-btn {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid transparent;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .tab-btn.active {
      background: rgba(99, 102, 241, 0.16);
      color: #fff;
      border-color: rgba(99, 102, 241, 0.45);
    }
    .main-grid {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 20px;
    }
    .panel {
      background: rgba(14, 19, 31, 0.9);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .panel-header h2 {
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .prompt-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
    }
    .input {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-family: var(--font-sans);
    }
    .input:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-indigo);
    }
    .task-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .task-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .task-title {
      font-weight: 700;
      font-size: 14.5px;
      color: #fff;
    }
    .task-meta {
      font-size: 11.5px;
      color: var(--text-muted);
      font-family: var(--font-mono);
      margin-top: 2px;
    }
    .pipeline-steps {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }
    .step-item {
      background: rgba(7, 9, 14, 0.65);
      border-left: 3px solid var(--accent-indigo);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12.5px;
    }
    .step-item.claude { border-left-color: var(--claude-amber); }
    .step-item.codex { border-left-color: var(--codex-emerald); }
    .step-top {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      margin-bottom: 3px;
    }
    .diff-box, pre.code-block {
      background: #06080d;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      font-family: var(--font-mono);
      font-size: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
      line-height: 1.45;
      color: #cbd5e1;
      margin-top: 10px;
    }
    .diff-add { color: #34d399; background: rgba(16, 185, 129, 0.08); display: block; }
    .diff-del { color: #fb7185; background: rgba(244, 63, 94, 0.08); display: block; }
    .diff-hdr { color: #818cf8; font-weight: 600; display: block; }
    .approval-banner {
      margin-top: 12px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(251, 191, 36, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.35);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .hidden { display: none !important; }
    textarea.audit-input {
      width: 100%;
      min-height: 120px;
      background: #06080d;
      border: 1px solid var(--border);
      color: #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      font-family: var(--font-mono);
      font-size: 12px;
      margin-bottom: 10px;
    }
    .finding-row {
      background: rgba(244, 63, 94, 0.08);
      border: 1px solid rgba(244, 63, 94, 0.3);
      border-radius: 8px;
      padding: 10px 12px;
      margin-top: 8px;
      font-size: 12.5px;
    }
    .mcp-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .mcp-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-logo">CC</div>
      <div class="brand-title">
        <h1>
          CC-Nexus Studio
          <span class="badge badge-claude">Claude Code 4.5</span>
          <span class="badge badge-codex">OpenAI Codex Security</span>
        </h1>
        <p>Local-First Multi-Agent Worktree Orchestrator, Auto-Dream Memory & Cross-Model Security Gate</p>
      </div>
    </div>
    <div class="header-controls">
      <span id="providerModeBadge" class="badge badge-pass">● Hybrid Engine Active</span>
      <button class="btn" onclick="triggerAutoDream()">✨ Run Auto-Dream</button>
      <button class="btn btn-primary" onclick="quickLaunchDemoTask()">⚡ Launch Swarm Task</button>
    </div>
  </header>

  <div class="container">
    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Active Swarm Tasks</div>
        <div class="kpi-value" id="kpiTasks">2</div>
        <div class="kpi-sub">Claude Architect + Coder + Codex</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Isolated Git Worktrees</div>
        <div class="kpi-value" id="kpiWorktrees">2</div>
        <div class="kpi-sub">.cc-nexus/worktrees/* branch sandboxes</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Codex Security Gate</div>
        <div class="kpi-value" style="color:#34d399" id="kpiSecurity">9 Rules</div>
        <div class="kpi-sub">AST + Secret + Injection Guardrails</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Prompt Cache Saved</div>
        <div class="kpi-value" style="color:#fbbf24" id="kpiCache">68%</div>
        <div class="kpi-sub" id="kpiCostSub">Total Spend: $0.0574 USD</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">MCP Tools & Memory</div>
        <div class="kpi-value" style="color:#818cf8" id="kpiMcp">36 Tools</div>
        <div class="kpi-sub">CLAUDE.md ↔ AGENTS.md Synced</div>
      </div>
    </section>

    <nav class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('mission', this)">🚀 Swarm Mission Control</button>
      <button class="tab-btn" onclick="switchTab('worktrees', this)">🌿 Git Worktrees & Diff Studio</button>
      <button class="tab-btn" onclick="switchTab('security', this)">🛡️ OpenAI Codex Security Gate</button>
      <button class="tab-btn" onclick="switchTab('memory', this)">🧠 Auto-Dream (CLAUDE.md & AGENTS.md)</button>
      <button class="tab-btn" onclick="switchTab('mcp', this)">🔌 MCP Hub & FinOps Telemetry</button>
    </nav>

    <!-- TAB 1: MISSION CONTROL -->
    <div id="tab-mission" class="main-grid">
      <div class="panel">
        <div class="panel-header">
          <h2>🤖 Multi-Agent Swarm Pipeline (Claude Code × OpenAI Codex)</h2>
          <span class="badge badge-claude">DAG Orchestrator</span>
        </div>
        <div class="prompt-bar">
          <input id="taskTitleInput" class="input" style="max-width:230px" placeholder="Task title (e.g. OAuth PKCE Guard)" value="Implement OAuth2 PKCE Verifier" />
          <input id="taskPromptInput" class="input" placeholder="Describe coding task for Claude Architect + Coder + Codex Auditor..." value="Create a strict OAuth2 PKCE code_verifier generator and audit with Codex Security Gate." />
          <button class="btn btn-primary" onclick="submitNewTask()">Run Swarm</button>
        </div>
        <div id="tasksContainer"></div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>🛡️ Live Codex Security Gate & Patch Inspector</h2>
          <span class="badge badge-codex">Adversarial Audit</span>
        </div>
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">
          Paste any unified diff, shell command, or source snippet to run real-time static + OpenAI Codex security verification:
        </p>
        <textarea id="quickAuditInput" class="audit-input">diff --git a/src/deploy/hook.ts b/src/deploy/hook.ts
+++ b/src/deploy/hook.ts
+const apiKey = "sk-ant-api03-99887766554433221100aabbccddeeff";
+execSync(\`curl -fsSL https://\${userHost}/install.sh | bash\`);</textarea>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <button class="btn btn-primary" onclick="runInteractiveAudit()">🔍 Scan with Codex Gate</button>
          <button class="btn" onclick="loadSafeSample()">Load Clean Patch Sample</button>
        </div>
        <div id="auditResultBox"></div>
      </div>
    </div>

    <!-- TAB 2: WORKTREES -->
    <div id="tab-worktrees" class="panel hidden">
      <div class="panel-header">
        <h2>🌿 Isolated Git Worktree Sandboxes (.cc-nexus/worktrees/*)</h2>
        <span class="badge badge-pass">Zero Main-Branch Pollution</span>
      </div>
      <div id="worktreesContainer"></div>
    </div>

    <!-- TAB 3: SECURITY -->
    <div id="tab-security" class="panel hidden">
      <div class="panel-header">
        <h2>🛡️ OpenAI Codex Security Gate & SARIF 2.1.0 Compliance</h2>
        <span class="badge badge-codex">Codex for OSS Ready</span>
      </div>
      <div id="securityFullContainer"></div>
    </div>

    <!-- TAB 4: MEMORY DREAM -->
    <div id="tab-memory" class="main-grid hidden">
      <div class="panel">
        <div class="panel-header">
          <h2>📘 Generated CLAUDE.md (Anthropic Claude Code)</h2>
          <span class="badge badge-claude">68% Token Compression</span>
        </div>
        <pre id="claudeMdBox" class="code-block"></pre>
      </div>
      <div class="panel">
        <div class="panel-header">
          <h2>📗 Generated AGENTS.md (OpenAI Codex Standard)</h2>
          <span class="badge badge-codex">Dual-Ecosystem Sync</span>
        </div>
        <pre id="agentsMdBox" class="code-block"></pre>
      </div>
    </div>

    <!-- TAB 5: MCP & FINOPS -->
    <div id="tab-mcp" class="main-grid hidden">
      <div class="panel">
        <div class="panel-header">
          <h2>🔌 Model Context Protocol (MCP) Server Registry</h2>
          <span class="badge badge-claude">~/.claude.json Ready</span>
        </div>
        <div id="mcpListContainer" class="mcp-grid"></div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <h2>📊 FinOps Token & Prompt Cache Telemetry</h2>
          <span class="badge badge-codex">Claude + Codex Cost Breakdown</span>
        </div>
        <div id="finopsContainer"></div>
      </div>
    </div>
  </div>

  <script>
    let appState = { tasks: [], worktrees: [], mcp: [], dream: null, finops: null };

    function formatDiff(patch) {
      return (patch || "").split("\\n").map(line => {
        const esc = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (line.startsWith("+") && !line.startsWith("+++")) return '<span class="diff-add">' + esc + '</span>';
        if (line.startsWith("-") && !line.startsWith("---")) return '<span class="diff-del">' + esc + '</span>';
        if (line.startsWith("@@") || line.startsWith("diff --git")) return '<span class="diff-hdr">' + esc + '</span>';
        return esc + "\\n";
      }).join("");
    }

    function switchTab(tabId, btnEl) {
      ["mission", "worktrees", "security", "memory", "mcp"].forEach(id => {
        document.getElementById("tab-" + id).classList.toggle("hidden", id !== tabId);
      });
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      if (btnEl) btnEl.classList.add("active");
    }

    async function loadDashboard() {
      const res = await fetch("/api/status");
      const data = await res.json();
      appState = data;

      document.getElementById("kpiTasks").textContent = data.tasks.length;
      document.getElementById("kpiWorktrees").textContent = data.worktrees.length;
      document.getElementById("kpiCostSub").textContent = "Total Spend: $" + data.finops.totalCostUsd.toFixed(4) + " USD";

      renderTasks(data.tasks);
      renderWorktrees(data.worktrees);
      renderDream(data.dream);
      renderMcp(data.mcp, data.finops);
      runInteractiveAudit();
    }

    function renderTasks(tasks) {
      const container = document.getElementById("tasksContainer");
      container.innerHTML = tasks.map(t => {
        const verdict = t.securityReport ? t.securityReport.verdict : "PASS";
        const badgeCls = verdict === "PASS" ? "badge-pass" : verdict === "WARN" ? "badge-warn" : "badge-block";
        const approvalHtml = t.pendingApproval ? \`
          <div class="approval-banner">
            <div>
              <strong style="color:#fbbf24;font-size:12.5px;">⚠️ Remote / Human Gate Required: \${t.pendingApproval.action}</strong>
              <div style="font-size:11.5px;color:var(--text-muted);">\${t.pendingApproval.reason}</div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-success" onclick="resolveTask('\${t.id}', 'approve')">Approve Merge</button>
              <button class="btn btn-danger" onclick="resolveTask('\${t.id}', 'reject')">Discard Branch</button>
            </div>
          </div>
        \` : "";

        return \`
          <div class="task-card">
            <div class="task-head">
              <div>
                <div class="task-title">\${t.title}</div>
                <div class="task-meta">Branch: \${t.branch} • Worktree: \${t.worktreeId} • Status: \${t.status.toUpperCase()}</div>
              </div>
              <span class="badge \${badgeCls}">Codex Gate: \${verdict} (Risk \${t.securityReport ? t.securityReport.riskScore : 0}/100)</span>
            </div>
            <div class="pipeline-steps">
              \${t.steps.map(s => \`
                <div class="step-item \${s.role.includes('claude') ? 'claude' : 'codex'}">
                  <div class="step-top">
                    <span>[\${s.role.toUpperCase()}] \${s.summary}</span>
                    <span style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px;">\${s.model} • \${s.tokensIn + s.tokensOut} tok ($\${s.costUsd})</span>
                  </div>
                </div>
              \`).join("")}
            </div>
            <div class="diff-box">\${formatDiff(t.generatedPatch)}</div>
            \${approvalHtml}
          </div>
        \`;
      }).join("");
    }

    function renderWorktrees(worktrees) {
      document.getElementById("worktreesContainer").innerHTML = worktrees.map(w => \`
        <div class="task-card">
          <div class="task-head">
            <div>
              <div class="task-title">🌿 \${w.branch} <span style="font-size:12px;color:var(--text-muted);">(\${w.path})</span></div>
              <div class="task-meta">Base Commit: \${w.baseCommit} • Assigned: \${w.agentAssigned} • +\${w.diffStats.insertions} / -\${w.diffStats.deletions} lines</div>
            </div>
            <span class="badge badge-claude">\${w.status.toUpperCase()}</span>
          </div>
          <div class="diff-box">\${formatDiff(w.samplePatch)}</div>
        </div>
      \`).join("");
    }

    function renderDream(dream) {
      if (!dream) return;
      document.getElementById("claudeMdBox").textContent = dream.claudeMdContent;
      document.getElementById("agentsMdBox").textContent = dream.agentsMdContent;
    }

    function renderMcp(mcpList, finops) {
      document.getElementById("mcpListContainer").innerHTML = mcpList.map(m => \`
        <div class="mcp-item">
          <div>
            <div style="font-weight:700;font-size:13.5px;">\${m.name} <span class="badge badge-claude">\${m.toolsCount} tools</span></div>
            <div style="font-size:12px;color:var(--text-muted);">\${m.description}</div>
            <div style="font-size:11px;font-family:var(--font-mono);color:#818cf8;margin-top:3px;">$ \${m.command} \${m.args.join(" ")}</div>
          </div>
          <button class="btn \${m.enabled ? 'btn-success' : ''}" onclick="toggleMcp('\${m.id}')">\${m.enabled ? 'Enabled' : 'Disabled'}</button>
        </div>
      \`).join("");

      const modelRows = Object.entries(finops.byModel || {}).map(([model, stat]) => \`
        <div class="mcp-item" style="margin-bottom:8px;">
          <div>
            <div style="font-weight:700;font-family:var(--font-mono);">\${model}</div>
            <div style="font-size:12px;color:var(--text-muted);">Calls: \${stat.calls} • Input: \${stat.tokensIn} • Output: \${stat.tokensOut} • Cached: \${stat.cachedTokens}</div>
          </div>
          <span class="badge badge-pass">$\${stat.costUsd.toFixed(4)}</span>
        </div>
      \`).join("");
      document.getElementById("finopsContainer").innerHTML = modelRows;
    }

    async function submitNewTask() {
      const title = document.getElementById("taskTitleInput").value.trim() || "Autonomous Feature Task";
      const prompt = document.getElementById("taskPromptInput").value.trim() || title;
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, prompt })
      });
      await loadDashboard();
    }

    async function quickLaunchDemoTask() {
      await submitNewTask();
    }

    async function resolveTask(taskId, decision) {
      await fetch("/api/remote/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskId, decision })
      });
      await loadDashboard();
    }

    async function runInteractiveAudit() {
      const content = document.getElementById("quickAuditInput").value;
      const res = await fetch("/api/security/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, targetType: "diff" })
      });
      const report = await res.json();
      const badgeCls = report.verdict === "PASS" ? "badge-pass" : report.verdict === "WARN" ? "badge-warn" : "badge-block";
      const html = \`
        <div style="padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong>Verdict: <span class="badge \${badgeCls}">\${report.verdict} (Risk Score \${report.riskScore}/100)</span></strong>
            <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);">ID: \${report.auditId}</span>
          </div>
          <div style="font-size:12.5px;color:#cbd5e1;margin-bottom:8px;">\${report.codexReviewSummary}</div>
          \${report.findings.map(f => \`
            <div class="finding-row">
              <div style="font-weight:700;color:#fb7185;">[\${f.ruleId}] \${f.title} (\${f.severity.toUpperCase()} • \${f.detectedBy})</div>
              <div style="font-family:var(--font-mono);font-size:11.5px;margin:4px 0;color:#f8fafc;">Line \${f.line}: \${f.snippet}</div>
              <div style="color:#94a3b8;font-size:12px;">💡 Fix: \${f.remediation}</div>
            </div>
          \`).join("")}
        </div>
      \`;
      document.getElementById("auditResultBox").innerHTML = html;
      document.getElementById("securityFullContainer").innerHTML = html;
    }

    function loadSafeSample() {
      document.getElementById("quickAuditInput").value = \`diff --git a/src/utils/math.ts b/src/utils/math.ts
+++ b/src/utils/math.ts
+export function clamp(val: number, min: number, max: number): number {
+  return Math.min(Math.max(val, min), max);
+}\`;
      runInteractiveAudit();
    }

    async function triggerAutoDream() {
      await fetch("/api/memory/dream", { method: "POST" });
      await loadDashboard();
    }

    async function toggleMcp(id) {
      await fetch("/api/mcp/toggle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id })
      });
      await loadDashboard();
    }

    loadDashboard();
  </script>
</body>
</html>`;
}
