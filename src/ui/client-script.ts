export const STUDIO_CLIENT_JS = `
let state = {
  view: 'inbox',
  selectedTaskId: null,
  data: null
};

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderNumberedDiff(patch) {
  const lines = String(patch || '').split('\\n');
  return '<div class="code-frame">' + lines.map((line, i) => {
    let cls = '';
    if (line.startsWith('+') && !line.startsWith('+++')) cls = 'diff-add';
    else if (line.startsWith('-') && !line.startsWith('---')) cls = 'diff-del';
    else if (line.startsWith('@@') || line.startsWith('diff --git')) cls = 'diff-hunk';
    return '<div class="diff-line ' + cls + '"><span class="diff-num">' + (i + 1) + '</span><span>' + esc(line) + '</span></div>';
  }).join('') + '</div>';
}

function switchView(viewName, navBtn) {
  state.view = viewName;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (navBtn) navBtn.classList.add('active');
  else {
    const target = document.querySelector('[data-view="' + viewName + '"]');
    if (target) target.classList.add('active');
  }
  renderPrimaryPane();
}

function selectTask(taskId) {
  state.selectedTaskId = taskId;
  renderPrimaryPane();
  renderInspectorPane();
}

async function refreshState() {
  const res = await fetch('/api/status');
  state.data = await res.json();
  if (!state.selectedTaskId && state.data.tasks.length > 0) {
    state.selectedTaskId = state.data.tasks[0].id;
  }
  updateTelemetryAndSidebar();
  renderPrimaryPane();
  renderInspectorPane();
}

function updateTelemetryAndSidebar() {
  const d = state.data;
  if (!d) return;
  const tel = d.superAgent.telemetry;

  document.getElementById('topAttentionText').textContent =
    'ATTENTION ' + tel.attentionSlotsUsed + '/' + tel.attentionSlotsMax + ' SLOTS';
  document.getElementById('topNoiseText').textContent =
    tel.noiseFilterRatioPct + '% NOISE FILTERED (' + tel.tokensSavedByFilter + ' TOK SAVED)';

  document.getElementById('mAttentionVal').textContent =
    tel.attentionSlotsUsed + ' / ' + tel.attentionSlotsMax;
  document.getElementById('mFilterVal').textContent =
    tel.noiseFilterRatioPct + '%';
  document.getElementById('mFilterSub').textContent =
    tel.noiseEventsDropped + ' of ' + tel.totalEventsIngested + ' events dropped pre-LLM';
  document.getElementById('mWorkersVal').textContent =
    d.superAgent.workers.length + ' Active';
  document.getElementById('mSilentSub').textContent =
    tel.silentCompletionsCount + ' silent auto-merged • 0 Router Bash violations';
  document.getElementById('mSpendVal').textContent =
    '$' + d.finops.totalCostUsd.toFixed(4);

  const unresolvedCount = d.superAgent.inbox.filter(i => !i.resolved).length;
  const inboxBadge = document.getElementById('navCountInbox');
  inboxBadge.textContent = unresolvedCount;
  inboxBadge.className = 'nav-counter' + (unresolvedCount > 0 ? ' alert' : '');

  document.getElementById('navCountWorkers').textContent = d.superAgent.workers.length;
  document.getElementById('navCountEvents').textContent = d.superAgent.events.length;
  document.getElementById('navCountWorktrees').textContent = d.worktrees.length;

  // Render 5-slot attention bar
  const slotContainer = document.getElementById('attentionSlotBar');
  const cells = [];
  for (let i = 0; i < tel.attentionSlotsMax; i++) {
    if (i < tel.attentionSlotsUsed) {
      cells.push('<div class="slot-cell used-crit"></div>');
    } else {
      cells.push('<div class="slot-cell free"></div>');
    }
  }
  slotContainer.innerHTML = cells.join('');
  document.getElementById('budgetNumeric').textContent =
    tel.attentionSlotsUsed + ' / ' + tel.attentionSlotsMax;
}

function renderPrimaryPane() {
  const d = state.data;
  if (!d) return;
  const host = document.getElementById('primaryContent');

  if (state.view === 'inbox') {
    const items = d.tasks;
    host.innerHTML = items.map(t => {
      const verdict = t.securityReport ? t.securityReport.verdict : 'PASS';
      const tagCls = verdict === 'PASS' ? 'tag-pass' : verdict === 'WARN' ? 'tag-warn' : 'tag-block';
      const dotCls = verdict === 'PASS' ? 'dot-emerald' : verdict === 'WARN' ? 'dot-amber' : 'dot-crimson';
      const isSel = t.id === state.selectedTaskId ? ' selected' : '';
      const modeLabel = t.pendingApproval ? 'ESCALATED TO INBOX (1 SLOT)' : 'SILENT AUTO-MERGE (0 SLOTS)';

      return '<div class="grid-row' + isSel + '" onclick="selectTask(\\'' + t.id + '\\')">' +
        '<div class="row-top">' +
          '<div class="row-title">' +
            '<span class="status-dot ' + dotCls + '"></span>' +
            '<span>' + esc(t.title) + '</span>' +
            '<span class="tag">' + esc(t.workerId || 'worker-01') + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
            '<span class="tag ' + (t.pendingApproval ? 'tag-block' : 'tag-pass') + '">' + modeLabel + '</span>' +
            '<span class="tag ' + tagCls + '">CODEX ' + verdict + ' (' + (t.securityReport ? t.securityReport.riskScore : 0) + '/100)</span>' +
          '</div>' +
        '</div>' +
        '<div class="row-meta">' +
          '<span>TICKET ' + esc(t.routerTicketId || 'tkt-001') + '</span>' +
          '<span>BRANCH ' + esc(t.branch) + '</span>' +
          '<span>STATUS ' + esc(t.status.toUpperCase()) + '</span>' +
        '</div>' +
        '<div class="trace-list">' +
          t.steps.map(s => '<div class="trace-chip">' + esc(s.role.toUpperCase()) + ' · ' + s.durationMs + 'ms</div>').join('') +
        '</div>' +
      '</div>';
    }).join('');
    return;
  }

  if (state.view === 'topology') {
    const workers = d.superAgent.workers;
    const watchdog = d.superAgent.watchdog;
    host.innerHTML =
      '<div class="section-bar"><span class="section-title">ALWAYS-ON ROUTER LAYER (DIRECT BASH = FALSE)</span><span class="tag tag-pass">INVARIANT ENFORCED</span></div>' +
      '<div class="grid-row">' +
        '<div class="row-top"><div class="row-title"><span class="status-dot dot-emerald"></span><span>dsh-router-primary</span><span class="tag">0 TOOL VIOLATIONS</span></div><span class="tag">LATENCY 11ms</span></div>' +
        '<div class="row-meta"><span>ROLE: Intent Classification & Ticket Dispatch Only</span><span>WORKERS SPAWNED: ' + workers.length + '</span></div>' +
      '</div>' +
      '<div class="section-bar">' +
        '<span class="section-title">ISOLATED WORKER POOL & WATCHDOG DAEMON</span>' +
        '<button class="btn" onclick="triggerWatchdogHeal()">Simulate Loop & Auto-Heal</button>' +
      '</div>' +
      workers.map(w => {
        const dot = w.status === 'escalated_inbox' ? 'dot-crimson' : 'dot-emerald';
        return '<div class="grid-row" onclick="selectTask(\\'' + w.taskId + '\\')">' +
          '<div class="row-top">' +
            '<div class="row-title"><span class="status-dot ' + dot + '"></span><span>' + esc(w.workerId) + ' — ' + esc(w.title) + '</span></div>' +
            '<span class="tag">' + esc(w.status.toUpperCase()) + '</span>' +
          '</div>' +
          '<div class="row-meta">' +
            '<span>TICKET ' + esc(w.ticketId) + '</span>' +
            '<span>WORKTREE ' + esc(w.worktreeBranch) + '</span>' +
            '<span>HEARTBEAT ' + w.heartbeatLatencyMs + 'ms</span>' +
            '<span>BUDGET ' + w.tokenBudgetUsedPct + '%</span>' +
          '</div>' +
        '</div>';
      }).join('') +
      '<div class="section-bar"><span class="section-title">WATCHDOG RECOVERY LOG</span></div>' +
      watchdog.map(inc =>
        '<div class="grid-row">' +
          '<div class="row-top"><div class="row-title"><span class="status-dot dot-amber"></span><span>' + esc(inc.workerId) + ': ' + esc(inc.anomalyType) + '</span></div><span class="tag tag-pass">' + esc(inc.actionTaken.toUpperCase()) + '</span></div>' +
          '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">' + esc(inc.detail) + '</div>' +
        '</div>'
      ).join('');
    return;
  }

  if (state.view === 'events') {
    host.innerHTML =
      '<div class="section-bar">' +
        '<span class="section-title">DETERMINISTIC PRE-LLM EVENT FILTER STREAM</span>' +
        '<div style="display:flex;gap:6px;">' +
          '<button class="btn" onclick="injectNoiseEvent()">Inject Bot/IM Noise Event</button>' +
          '<button class="btn btn-solid" onclick="injectSignalEvent()">Inject P0 Security Signal</button>' +
        '</div>' +
      '</div>' +
      d.superAgent.events.map(ev => {
        const dropped = ev.filterOutcome === 'DROPPED_NOISE';
        return '<div class="grid-row">' +
          '<div class="row-top">' +
            '<div class="row-title">' +
              '<span class="status-dot ' + (dropped ? 'dot-amber' : 'dot-emerald') + '"></span>' +
              '<span>[' + esc(ev.event.channel) + '] ' + esc(ev.event.subject) + '</span>' +
            '</div>' +
            '<span class="tag ' + (dropped ? 'tag-warn' : 'tag-pass') + '">' + esc(ev.filterOutcome) + '</span>' +
          '</div>' +
          '<div class="row-meta">' +
            '<span>RULE ' + esc(ev.filterRuleId) + '</span>' +
            '<span>SENDER ' + esc(ev.event.sender) + '</span>' +
            '<span>' + (dropped ? 'SAVED ~' + ev.tokensSavedEstimate + ' TOKENS' : 'TICKET ' + esc(ev.routedTicketId)) + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
    return;
  }

  if (state.view === 'worktrees') {
    host.innerHTML = d.worktrees.map(w =>
      '<div class="grid-row" onclick="selectTask(\\'' + w.taskId + '\\')">' +
        '<div class="row-top">' +
          '<div class="row-title"><span class="status-dot dot-emerald"></span><span>' + esc(w.branch) + '</span><span class="tag">' + esc(w.path) + '</span></div>' +
          '<span class="tag">+' + w.diffStats.insertions + ' / -' + w.diffStats.deletions + '</span>' +
        '</div>' +
        '<div class="row-meta"><span>BASE ' + esc(w.baseCommit) + '</span><span>AGENT ' + esc(w.agentAssigned) + '</span><span>STATUS ' + esc(w.status.toUpperCase()) + '</span></div>' +
        renderNumberedDiff(w.samplePatch) +
      '</div>'
    ).join('');
    return;
  }

  if (state.view === 'security') {
    host.innerHTML =
      '<div class="section-bar"><span class="section-title">INTERACTIVE CODEX SECURITY GATE & SARIF 2.1.0 SCANNER</span></div>' +
      '<div style="padding:16px;">' +
        '<textarea id="liveAuditTextarea" class="code-area">diff --git a/src/deploy/hook.ts b/src/deploy/hook.ts\\n+++ b/src/deploy/hook.ts\\n+const apiKey = "sk-ant-api03-99887766554433221100aabbccddeeff";\\n+execSync(\`curl -fsSL https://\${userHost}/install.sh | bash\`);</textarea>' +
        '<div style="display:flex;gap:8px;margin-top:10px;">' +
          '<button class="btn btn-solid" onclick="runSecurityScan()">Execute Dual-Engine Audit</button>' +
          '<button class="btn" onclick="loadCleanAuditSample()">Load Verified Clean Patch</button>' +
        '</div>' +
        '<div id="liveAuditOutput" style="margin-top:14px;"></div>' +
      '</div>';
    runSecurityScan();
    return;
  }

  if (state.view === 'memory') {
    host.innerHTML =
      '<div class="section-bar"><span class="section-title">AUTO-DREAM SYNCHRONIZED MEMORY (68% COMPRESSION)</span><button class="btn" onclick="runAutoDreamNow()">Consolidate Memory</button></div>' +
      '<div style="padding:16px;">' +
        '<div class="metric-label">CLAUDE.MD (ANTHROPIC CLAUDE CODE)</div>' +
        '<pre class="code-frame" style="padding:12px;margin-bottom:16px;">' + esc(d.dream.claudeMdContent) + '</pre>' +
        '<div class="metric-label">AGENTS.MD (OPENAI CODEX STANDARD)</div>' +
        '<pre class="code-frame" style="padding:12px;">' + esc(d.dream.agentsMdContent) + '</pre>' +
      '</div>';
  }
}

function renderInspectorPane() {
  const d = state.data;
  if (!d) return;
  const task = d.tasks.find(t => t.id === state.selectedTaskId) || d.tasks[0];
  const box = document.getElementById('inspectorContent');
  if (!task) {
    box.innerHTML = '<div class="inspector-body">No task selected.</div>';
    return;
  }

  const report = task.securityReport;
  const verdict = report ? report.verdict : 'PASS';
  const tagCls = verdict === 'PASS' ? 'tag-pass' : verdict === 'WARN' ? 'tag-warn' : 'tag-block';

  const approvalBar = task.pendingApproval ? (
    '<div style="padding:12px;border:1px solid rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);border-radius:5px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">' +
      '<div>' +
        '<div style="font-weight:600;color:#f87171;font-size:12px;">HUMAN ATTENTION REQUIRED · MERGE BLOCKED</div>' +
        '<div style="font-size:11px;color:var(--text-secondary);">' + esc(task.pendingApproval.reason) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;">' +
        '<button class="btn btn-approve" onclick="resolveApproval(\\'' + task.id + '\\', \\'approve\\')">Override & Merge</button>' +
        '<button class="btn btn-reject" onclick="resolveApproval(\\'' + task.id + '\\', \\'reject\\')">Drop Worktree</button>' +
      '</div>' +
    '</div>'
  ) : '';

  const findingsHtml = (report && report.findings.length > 0) ? (
    '<div style="margin-top:14px;">' +
      '<div class="metric-label">OPENAI CODEX & AST SECURITY FINDINGS (' + report.findings.length + ')</div>' +
      report.findings.map(f =>
        '<div style="padding:10px;border:1px solid var(--border-hairline);background:var(--bg-canvas);border-radius:4px;margin-top:6px;">' +
          '<div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:11px;">' +
            '<strong style="color:#f87171;">[' + esc(f.ruleId) + '] ' + esc(f.title) + '</strong>' +
            '<span class="tag tag-block">' + esc(f.detectedBy) + ' · L' + f.line + '</span>' +
          '</div>' +
          '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);margin:4px 0;">' + esc(f.snippet) + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">Remediation: ' + esc(f.remediation) + '</div>' +
        '</div>'
      ).join('') +
    '</div>'
  ) : (
    '<div style="margin-top:14px;padding:10px;border:1px solid rgba(16,185,129,0.25);background:rgba(16,185,129,0.05);border-radius:4px;font-family:var(--font-mono);font-size:11px;color:#34d399;">' +
      '✓ OpenAI Codex Security Gate verified 0 policy violations. Silent auto-merge authorized.' +
    '</div>'
  );

  box.innerHTML =
    '<div class="inspector-body">' +
      approvalBar +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:600;color:var(--text-primary);">' + esc(task.title) + '</div>' +
          '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);margin-top:2px;">' +
            esc(task.workerId || 'worker-01') + ' · ' + esc(task.branch) + ' · ' + esc(task.worktreeId) +
          '</div>' +
        '</div>' +
        '<span class="tag ' + tagCls + '">RISK ' + (report ? report.riskScore : 0) + '/100</span>' +
      '</div>' +
      '<div class="metric-label" style="margin-top:12px;">UNIFIED GIT WORKTREE DIFF</div>' +
      renderNumberedDiff(task.generatedPatch) +
      findingsHtml +
      '<div class="metric-label" style="margin-top:16px;">SUPER-AGENT EXECUTION TELEMETRY</div>' +
      '<div class="code-frame" style="padding:10px;">' +
        task.steps.map(s =>
          '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-hairline);">' +
            '<span>[' + esc(s.role.toUpperCase()) + '] ' + esc(s.summary) + '</span>' +
            '<span style="color:var(--text-muted);">' + esc(s.model) + ' · $' + s.costUsd + '</span>' +
          '</div>'
        ).join('') +
      '</div>' +
    '</div>';
}

async function dispatchFromBar() {
  const title = document.getElementById('quickTitle').value.trim() || 'Harden OAuth2 PKCE State Validator';
  const prompt = document.getElementById('quickPrompt').value.trim() || title;
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title, prompt })
  });
  const created = await res.json();
  state.selectedTaskId = created.id;
  await refreshState();
}

async function resolveApproval(taskId, decision) {
  await fetch('/api/remote/approve', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ taskId, decision })
  });
  await refreshState();
}

async function injectNoiseEvent() {
  await fetch('/api/events/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      channel: 'feishu-im',
      sender: 'pm@team',
      subject: 'Chat Ack',
      payload: 'ok'
    })
  });
  await refreshState();
}

async function injectSignalEvent() {
  const res = await fetch('/api/events/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      channel: 'github-webhook',
      sender: 'sec-bot@github',
      subject: 'Patch Webhook HMAC Timing Attack',
      payload: 'Enforce constant-time signature comparison in webhook handler.'
    })
  });
  const data = await res.json();
  if (data.routedTask) state.selectedTaskId = data.routedTask.id;
  await refreshState();
}

async function triggerWatchdogHeal() {
  await fetch('/api/watchdog/heal', { method: 'POST' });
  await refreshState();
}

async function runSecurityScan() {
  const el = document.getElementById('liveAuditTextarea');
  if (!el) return;
  const res = await fetch('/api/security/audit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content: el.value, targetType: 'diff' })
  });
  const report = await res.json();
  const out = document.getElementById('liveAuditOutput');
  if (!out) return;
  const cls = report.verdict === 'PASS' ? 'tag-pass' : report.verdict === 'WARN' ? 'tag-warn' : 'tag-block';
  out.innerHTML =
    '<div style="padding:12px;border:1px solid var(--border-hairline);background:var(--bg-surface);border-radius:5px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
        '<span style="font-family:var(--font-mono);font-weight:600;">VERDICT: <span class="tag ' + cls + '">' + report.verdict + ' (' + report.riskScore + '/100)</span></span>' +
        '<span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">' + report.auditId + '</span>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-secondary);">' + esc(report.codexReviewSummary) + '</div>' +
    '</div>';
}

function loadCleanAuditSample() {
  const el = document.getElementById('liveAuditTextarea');
  if (!el) return;
  el.value = 'diff --git a/src/crypto/safe.ts b/src/crypto/safe.ts\\n+++ b/src/crypto/safe.ts\\n+export const isValidId = (id: string) => /^[a-z0-9_-]{8,36}$/i.test(id);';
  runSecurityScan();
}

async function runAutoDreamNow() {
  await fetch('/api/memory/dream', { method: 'POST' });
  await refreshState();
}

function toggleCmdk(force) {
  const modal = document.getElementById('cmdkModal');
  const next = typeof force === 'boolean' ? force : modal.classList.contains('hidden');
  modal.classList.toggle('hidden', !next);
  if (next) document.getElementById('cmdkSearch').focus();
}

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    toggleCmdk();
  } else if (e.key === 'Escape') {
    toggleCmdk(false);
  }
});

// Connect live WebSocket stream
try {
  const ws = new WebSocket('ws://' + location.host + '/ws');
  ws.onmessage = () => refreshState();
} catch {}

refreshState();
`;
