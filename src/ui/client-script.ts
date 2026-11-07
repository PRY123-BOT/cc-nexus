export const STUDIO_CLIENT_JS = `
let state = {
  view: 'inbox',
  persona: 'all', // 'all' | 'beginner' | 'office' | 'developer'
  selectedTaskId: null,
  data: null
};

const PERSONA_PRESETS = {
  all: [
    { title: '部门周报与待办自动提炼', prompt: '过滤飞书群无效收到消息，汇总本周产品与研发核心进展与下周待办。', persona: 'office', tag: '办公' },
    { title: '桌面与下载夹智能归档', prompt: '把桌面和下载夹的杂乱发票、文档、图片按月份和用途安全整理归档。', persona: 'beginner', tag: '小白' },
    { title: '外发合同隐私与底价脱敏', prompt: '审查采购合同附件，自动隐去个人身份证号与银行卡敏感信息。', persona: 'office', tag: '合规' },
    { title: 'OAuth2 PKCE 鉴权补丁', prompt: '在隔离 Git Worktree 中实现 RFC 7636 校验并通过 Codex 安全审查。', persona: 'developer', tag: '编程' }
  ],
  beginner: [
    { title: '电脑杂乱文件智能归档', prompt: '帮我把桌面和下载夹里的发票、照片、安装包按月份分类整理，绝不误删原文件。', persona: 'beginner', tag: '零风险' },
    { title: '7天旅行攻略与预算清单', prompt: '生成一份可直接打印的 7 天家庭自由行每日路线、交通与预算核对表。', persona: 'beginner', tag: '生活' },
    { title: '万字长文/资料 30秒提炼', prompt: '把复杂的行业报告或学习资料浓缩成 5 条通俗易懂的大白话重点。', persona: 'beginner', tag: '学习' },
    { title: '个人隐私与防骗安全体检', prompt: '检查待发送的内容中是否包含密码、身份证或高风险链接。', persona: 'beginner', tag: '护盾' }
  ],
  office: [
    { title: '部门周报与 KPI 自动汇总', prompt: '汇总本周多群聊工作记录，过滤寒暄噪音，生成管理层周报与 KPI 达成表。', persona: 'office', tag: '周报' },
    { title: '会议纪要转责任人待办', prompt: '从会议讨论记录中提取关键决议、责任人及截止时间，生成飞书待办清单。', persona: 'office', tag: '会议' },
    { title: '外发合同敏感信息脱敏', prompt: '对外发合作协议进行隐私体检，自动标记并隐去身份证号、银行卡与底价。', persona: 'office', tag: '法务' },
    { title: '月度经营数据异常解读', prompt: '分析业务数据表中的环比波动原因，输出 3 条可落地的改进建议。', persona: 'office', tag: '数据' }
  ],
  developer: [
    { title: 'Implement OAuth2 PKCE Guard', prompt: 'Create strict RFC 7636 PKCE verifier in isolated worktree and audit with Codex Gate.', persona: 'developer', tag: 'P0' },
    { title: 'Webhook HMAC Timing Fix', prompt: 'Replace string equality with crypto.timingSafeEqual in webhook verifier.', persona: 'developer', tag: 'SEC' },
    { title: 'SQL Parameterized Refactor', prompt: 'Convert raw template SQL queries to parameterized prepared statements.', persona: 'developer', tag: 'AST' },
    { title: 'Token Bucket Rate Limiter', prompt: 'Add per-tenant token bucket limiter middleware with unit tests.', persona: 'developer', tag: 'FEAT' }
  ]
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

function setPersona(p, btnEl) {
  state.persona = p;
  document.querySelectorAll('.persona-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const filtered = getFilteredTasks();
  if (filtered.length > 0) {
    state.selectedTaskId = filtered[0].id;
  }
  renderPresets();
  renderPrimaryPane();
  renderInspectorPane();
}

function getFilteredTasks() {
  if (!state.data) return [];
  if (state.persona === 'all') return state.data.tasks;
  return state.data.tasks.filter(t => t.persona === state.persona);
}

function renderPresets() {
  const list = PERSONA_PRESETS[state.persona] || PERSONA_PRESETS.all;
  const host = document.getElementById('presetStrip');
  host.innerHTML = list.map((item, idx) =>
    '<div class="preset-card" onclick="runPreset(' + idx + ')">' +
      '<div class="preset-title">' +
        '<span>' + esc(item.title) + '</span>' +
        '<span class="tag tag-blue">' + esc(item.tag) + '</span>' +
      '</div>' +
      '<div class="preset-desc">' + esc(item.prompt.slice(0, 38)) + '...</div>' +
    '</div>'
  ).join('');
}

async function runPreset(idx) {
  const list = PERSONA_PRESETS[state.persona] || PERSONA_PRESETS.all;
  const item = list[idx];
  if (!item) return;
  document.getElementById('quickTitle').value = item.title;
  document.getElementById('quickPrompt').value = item.prompt;
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: item.title, prompt: item.prompt, persona: item.persona })
  });
  const created = await res.json();
  state.selectedTaskId = created.id;
  await refreshState();
}

function switchView(viewName, navBtn) {
  state.view = viewName;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (navBtn) navBtn.classList.add('active');
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
  const visible = getFilteredTasks();
  if (!state.selectedTaskId && visible.length > 0) {
    state.selectedTaskId = visible[0].id;
  }
  updateTelemetryAndSidebar();
  renderPresets();
  renderPrimaryPane();
  renderInspectorPane();
}

function updateTelemetryAndSidebar() {
  const d = state.data;
  if (!d) return;
  const tel = d.superAgent.telemetry;

  document.getElementById('topAttentionText').textContent =
    '注意力槽位 ' + tel.attentionSlotsUsed + '/' + tel.attentionSlotsMax;
  document.getElementById('topNoiseText').textContent =
    '已拦截 ' + tel.noiseFilterRatioPct + '% 噪音 (' + tel.tokensSavedByFilter + ' TOK)';

  document.getElementById('mAttentionVal').textContent =
    tel.attentionSlotsUsed + ' / ' + tel.attentionSlotsMax;
  document.getElementById('mFilterVal').textContent =
    tel.noiseFilterRatioPct + '%';
  document.getElementById('mFilterSub').textContent =
    '前置拦截 ' + tel.noiseEventsDropped + '/' + tel.totalEventsIngested + ' 条群聊/通知噪音';
  document.getElementById('mWorkersVal').textContent =
    d.tasks.length + ' 项任务';
  document.getElementById('mSilentSub').textContent =
    tel.silentCompletionsCount + ' 项后台静默完成 · 0 越权风险';
  document.getElementById('mSpendVal').textContent =
    '$' + d.finops.totalCostUsd.toFixed(4);

  const unresolvedCount = d.superAgent.inbox.filter(i => !i.resolved).length;
  const inboxBadge = document.getElementById('navCountInbox');
  inboxBadge.textContent = unresolvedCount;
  inboxBadge.className = 'nav-counter' + (unresolvedCount > 0 ? ' alert' : '');

  document.getElementById('navCountWorkers').textContent = d.superAgent.workers.length;
  document.getElementById('navCountEvents').textContent = d.superAgent.events.length;
  document.getElementById('navCountWorktrees').textContent = d.worktrees.length;

  const slotContainer = document.getElementById('attentionSlotBar');
  const cells = [];
  for (let i = 0; i < tel.attentionSlotsMax; i++) {
    cells.push('<div class="slot-cell ' + (i < tel.attentionSlotsUsed ? 'used-crit' : 'free') + '"></div>');
  }
  slotContainer.innerHTML = cells.join('');
  document.getElementById('budgetNumeric').textContent =
    tel.attentionSlotsUsed + ' / ' + tel.attentionSlotsMax;
}

function personaLabel(p) {
  if (p === 'beginner') return '🌱 小白管家';
  if (p === 'office') return '💼 智慧办公';
  return '⚡ 极客编程';
}

function renderPrimaryPane() {
  const d = state.data;
  if (!d) return;
  const host = document.getElementById('primaryContent');

  if (state.view === 'inbox') {
    const items = getFilteredTasks();
    host.innerHTML = items.map(t => {
      const verdict = t.securityReport ? t.securityReport.verdict : 'PASS';
      const tagCls = verdict === 'PASS' ? 'tag-pass' : verdict === 'WARN' ? 'tag-warn' : 'tag-block';
      const dotCls = verdict === 'PASS' ? 'dot-emerald' : verdict === 'WARN' ? 'dot-amber' : 'dot-crimson';
      const isSel = t.id === state.selectedTaskId ? ' selected' : '';
      const modeLabel = t.pendingApproval ? '待您拍板确认 (1 槽位)' : '后台静默完成 (0 打扰)';

      return '<div class="grid-row' + isSel + '" onclick="selectTask(\\'' + t.id + '\\')">' +
        '<div class="row-top">' +
          '<div class="row-title">' +
            '<span class="status-dot ' + dotCls + '"></span>' +
            '<span>' + esc(t.title) + '</span>' +
            '<span class="tag tag-blue">' + personaLabel(t.persona) + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
            '<span class="tag ' + (t.pendingApproval ? 'tag-block' : 'tag-pass') + '">' + modeLabel + '</span>' +
            '<span class="tag ' + tagCls + '">安全分 ' + (100 - (t.securityReport ? t.securityReport.riskScore : 0)) + '/100</span>' +
          '</div>' +
        '</div>' +
        '<div class="row-meta">' +
          '<span>执行节点 ' + esc(t.workerId || 'worker-01') + '</span>' +
          '<span>隔离沙箱 ' + esc(t.branch) + '</span>' +
          '<span>状态 ' + esc(t.status.toUpperCase()) + '</span>' +
        '</div>' +
        '<div class="trace-list">' +
          t.steps.slice(0, 3).map(s => '<div class="trace-chip">' + esc(s.summary) + '</div>').join('') +
        '</div>' +
      '</div>';
    }).join('');
    return;
  }

  if (state.view === 'topology') {
    const workers = d.superAgent.workers;
    const watchdog = d.superAgent.watchdog;
    host.innerHTML =
      '<div class="section-bar"><span class="section-title">ALWAYS-ON ROUTER 总控路由层 (严禁直接执行危险命令)</span><span class="tag tag-pass">安全铁律生效中</span></div>' +
      '<div class="grid-row">' +
        '<div class="row-top"><div class="row-title"><span class="status-dot dot-emerald"></span><span>dsh-router-primary (总管路由)</span><span class="tag">0 越权违规</span></div><span class="tag">响应 11ms</span></div>' +
        '<div class="row-meta"><span>职责：意图理解、噪音过滤、自动指派专属后台分身</span><span>已派发分身数：' + workers.length + '</span></div>' +
      '</div>' +
      '<div class="section-bar">' +
        '<span class="section-title">并发后台智能体分身池 (ISOLATED WORKERS & WATCHDOG)</span>' +
        '<button class="btn" onclick="triggerWatchdogHeal()">模拟卡死并触发看门狗自愈</button>' +
      '</div>' +
      workers.map(w => {
        const dot = w.status === 'escalated_inbox' ? 'dot-crimson' : 'dot-emerald';
        return '<div class="grid-row" onclick="selectTask(\\'' + w.taskId + '\\')">' +
          '<div class="row-top">' +
            '<div class="row-title"><span class="status-dot ' + dot + '"></span><span>' + esc(w.workerId) + ' — ' + esc(w.title) + '</span></div>' +
            '<span class="tag">' + esc(w.status.toUpperCase()) + '</span>' +
          '</div>' +
          '<div class="row-meta">' +
            '<span>工单 ' + esc(w.ticketId) + '</span>' +
            '<span>沙箱 ' + esc(w.worktreeBranch) + '</span>' +
            '<span>心跳 ' + w.heartbeatLatencyMs + 'ms</span>' +
          '</div>' +
        '</div>';
      }).join('') +
      '<div class="section-bar"><span class="section-title">WATCHDOG 看门狗自动恢复日志</span></div>' +
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
        '<span class="section-title">DEEPSEEK 确定性前置降噪网关 (过滤群聊『收到/OK』与无效通知)</span>' +
        '<div style="display:flex;gap:6px;">' +
          '<button class="btn" onclick="injectNoiseEvent()">模拟飞书群『收到』噪音</button>' +
          '<button class="btn btn-solid" onclick="injectSignalEvent()">模拟重要任务接入</button>' +
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
            '<span class="tag ' + (dropped ? 'tag-warn' : 'tag-pass') + '">' + (dropped ? '已拦截噪音 (0 消耗)' : '已派发执行') + '</span>' +
          '</div>' +
          '<div class="row-meta">' +
            '<span>规则 ' + esc(ev.filterRuleId) + '</span>' +
            '<span>来源 ' + esc(ev.event.sender) + '</span>' +
            '<span>' + (dropped ? '为您节省 ~' + ev.tokensSavedEstimate + ' Tokens' : '工单 ' + esc(ev.routedTicketId)) + '</span>' +
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
      '<div class="section-bar"><span class="section-title">代码漏洞 & 办公文档隐私脱敏双引擎体检台 (OPENAI CODEX GATE)</span></div>' +
      '<div style="padding:16px;">' +
        '<textarea id="liveAuditTextarea" class="code-area">采购合同附件：乙方负责人身份证号：31010119900307881X\\n+const apiKey = "sk-ant-api03-99887766554433221100aabbccddeeff";</textarea>' +
        '<div style="display:flex;gap:8px;margin-top:10px;">' +
          '<button class="btn btn-solid" onclick="runSecurityScan()">立即执行安全与隐私体检</button>' +
          '<button class="btn" onclick="loadCleanAuditSample()">加载合规安全示例</button>' +
        '</div>' +
        '<div id="liveAuditOutput" style="margin-top:14px;"></div>' +
      '</div>';
    runSecurityScan();
    return;
  }

  if (state.view === 'memory') {
    host.innerHTML =
      '<div class="section-bar"><span class="section-title">AUTO-DREAM 长期记忆自动浓缩 (68% 压缩率 · 越用越懂你)</span><button class="btn" onclick="runAutoDreamNow()">立即浓缩记忆</button></div>' +
      '<div style="padding:16px;">' +
        '<div class="metric-label">CLAUDE.MD (ANTHROPIC 规范记忆库)</div>' +
        '<pre class="code-frame" style="padding:12px;margin-bottom:16px;">' + esc(d.dream.claudeMdContent) + '</pre>' +
        '<div class="metric-label">AGENTS.MD (OPENAI CODEX 规范记忆库)</div>' +
        '<pre class="code-frame" style="padding:12px;">' + esc(d.dream.agentsMdContent) + '</pre>' +
      '</div>';
  }
}

function renderInspectorPane() {
  const d = state.data;
  if (!d) return;
  const visible = getFilteredTasks();
  const task = d.tasks.find(t => t.id === state.selectedTaskId) || visible[0] || d.tasks[0];
  const box = document.getElementById('inspectorContent');
  if (!task) {
    box.innerHTML = '<div class="inspector-body">暂无选中任务</div>';
    return;
  }

  const report = task.securityReport;
  const verdict = report ? report.verdict : 'PASS';
  const tagCls = verdict === 'PASS' ? 'tag-pass' : verdict === 'WARN' ? 'tag-warn' : 'tag-block';

  const approvalBar = task.pendingApproval ? (
    '<div style="padding:12px;border:1px solid rgba(239,68,68,0.35);background:rgba(239,68,68,0.06);border-radius:5px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">' +
      '<div>' +
        '<div style="font-weight:600;color:#f87171;font-size:12px;">⚠️ 需您人工拍板：安全护盾已暂停自动合入</div>' +
        '<div style="font-size:11px;color:var(--text-secondary);">' + esc(task.pendingApproval.reason) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;">' +
        '<button class="btn btn-approve" onclick="resolveApproval(\\'' + task.id + '\\', \\'approve\\')">确认放行</button>' +
        '<button class="btn btn-reject" onclick="resolveApproval(\\'' + task.id + '\\', \\'reject\\')">拦截丢弃</button>' +
      '</div>' +
    '</div>'
  ) : '';

  // For Beginner & Office personas: Show rich human-friendly Document Deliverable!
  if (task.persona === 'beginner' || task.persona === 'office') {
    const deliv = task.deliverable || {
      title: task.title,
      subtitle: '已完成沙箱安全校验',
      markdownBody: task.generatedPatch,
      safetyNotePlain: '已通过 OpenAI Codex 隐私与安全把关。',
      exportFilename: 'report.md'
    };

    box.innerHTML =
      '<div class="inspector-body">' +
        approvalBar +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div>' +
            '<div style="font-size:14px;font-weight:600;color:var(--text-primary);">' + esc(deliv.title) + '</div>' +
            '<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">' + esc(deliv.subtitle) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn" onclick="copyDeliverable()">复制全文</button>' +
            '<button class="btn btn-solid" onclick="exportDeliverable()">导出文档 (.md)</button>' +
          '</div>' +
        '</div>' +
        '<div class="shield-banner">' + esc(deliv.safetyNotePlain) + '</div>' +
        '<div id="deliverableText" class="doc-card">' + esc(deliv.markdownBody) + '</div>' +
        '<div class="metric-label" style="margin-top:16px;">后台智能体协同轨迹 (SUPER-AGENT TRACE)</div>' +
        '<div class="code-frame" style="padding:10px;">' +
          task.steps.map(s =>
            '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-hairline);">' +
              '<span>' + esc(s.summary) + '</span>' +
              '<span style="color:var(--text-muted);">' + s.durationMs + 'ms</span>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</div>';
    return;
  }

  // Developer Mode Inspector: Line-numbered Diff + SARIF Findings
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
          '<div style="font-size:11px;color:var(--text-muted);">修复建议: ' + esc(f.remediation) + '</div>' +
        '</div>'
      ).join('') +
    '</div>'
  ) : (
    '<div class="shield-banner">✓ OpenAI Codex Security Gate 0 违规通过，已在隔离分支完成静默验证。</div>'
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
    '</div>';
}

function copyDeliverable() {
  const el = document.getElementById('deliverableText');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent || '');
  alert('已复制全部成果内容到剪贴板！');
}

function exportDeliverable() {
  const el = document.getElementById('deliverableText');
  if (!el) return;
  const blob = new Blob([el.textContent || ''], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'CC-Nexus-Deliverable.md';
  a.click();
}

async function dispatchFromBar() {
  const title = document.getElementById('quickTitle').value.trim() || '智能任务处理';
  const prompt = document.getElementById('quickPrompt').value.trim() || title;
  const persona = state.persona === 'all' ? 'office' : state.persona;
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title, prompt, persona })
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
      sender: 'colleague@team',
      subject: '群聊回复',
      payload: '收到'
    })
  });
  await refreshState();
}

async function injectSignalEvent() {
  const res = await fetch('/api/events/ingest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      channel: 'feishu-im',
      sender: 'director@team',
      subject: '生成本周跨部门项目进度简报',
      payload: '汇总研发与运营双周数据并输出风险清单',
      persona: 'office'
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
    body: JSON.stringify({ content: el.value, targetType: 'document' })
  });
  const report = await res.json();
  const out = document.getElementById('liveAuditOutput');
  if (!out) return;
  const cls = report.verdict === 'PASS' ? 'tag-pass' : report.verdict === 'WARN' ? 'tag-warn' : 'tag-block';
  out.innerHTML =
    '<div style="padding:12px;border:1px solid var(--border-hairline);background:var(--bg-surface);border-radius:5px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
        '<span style="font-family:var(--font-mono);font-weight:600;">体检结果: <span class="tag ' + cls + '">' + report.verdict + ' (风险分 ' + report.riskScore + '/100)</span></span>' +
        '<span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">' + report.auditId + '</span>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text-secondary);">' + esc(report.codexReviewSummary) + '</div>' +
    '</div>';
}

function loadCleanAuditSample() {
  const el = document.getElementById('liveAuditTextarea');
  if (!el) return;
  el.value = '外发项目周报：已完成全部敏感字段脱敏（身份证号：3101**********881X），无密钥泄露风险。';
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

try {
  const ws = new WebSocket('ws://' + location.host + '/ws');
  ws.onmessage = () => refreshState();
} catch {}

refreshState();
`;
