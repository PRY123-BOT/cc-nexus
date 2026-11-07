import { STUDIO_CLIENT_JS } from "./client-script.ts";
import { STUDIO_CSS } from "./styles.ts";

export function renderStudioHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CC-Nexus Desktop v3.0 — 小白 · 办公 · 编程 全场景超级智能体工作站</title>
  <style>${STUDIO_CSS}</style>
</head>
<body>
  <div class="app-shell">
    <!-- TOP DESKTOP TITLE & PERSONA BAR -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="logo-mark">NX</div>
        <div class="breadcrumb">
          <strong>CC-Nexus Desktop</strong>
          <span style="color:var(--text-muted)">/</span>
          <span>Super-Agent Workstation v3.0</span>
        </div>
      </div>

      <!-- MULTI-PERSONA SEGMENTED SWITCHER -->
      <div class="persona-segmented">
        <button class="persona-btn active" onclick="setPersona('all', this)">全部视图 · All</button>
        <button class="persona-btn" onclick="setPersona('beginner', this)">🌱 小白管家 · Beginner</button>
        <button class="persona-btn" onclick="setPersona('office', this)">💼 智慧办公 · Office</button>
        <button class="persona-btn" onclick="setPersona('developer', this)">⚡ 极客编程 · Dev</button>
      </div>

      <div class="topbar-right">
        <div class="attention-pill" onclick="toggleCmdk(true)" style="cursor:pointer;">
          <span>快捷命令</span>
          <span class="kbd">Ctrl+K</span>
        </div>
        <div class="attention-pill">
          <span class="status-dot dot-emerald"></span>
          <span id="topNoiseText">已拦截 60% 噪音</span>
        </div>
        <div class="attention-pill">
          <span class="status-dot dot-amber"></span>
          <span id="topAttentionText">注意力槽位 1/5</span>
        </div>
      </div>
    </header>

    <!-- LEFT NAVIGATION RAIL -->
    <aside class="sidebar">
      <div>
        <div class="nav-group-label">核心工作台 (Super-Agent)</div>
        <button class="nav-item active" data-view="inbox" onclick="switchView('inbox', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            <span>任务与决策收件箱</span>
          </span>
          <span id="navCountInbox" class="nav-counter alert">1</span>
        </button>

        <button class="nav-item" data-view="topology" onclick="switchView('topology', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
            <span>总管与后台分身池</span>
          </span>
          <span id="navCountWorkers" class="nav-counter">4</span>
        </button>

        <button class="nav-item" data-view="events" onclick="switchView('events', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>消息与群聊降噪网</span>
          </span>
          <span id="navCountEvents" class="nav-counter">5</span>
        </button>

        <div class="nav-group-label" style="margin-top:12px;">安全护盾与研发工具</div>
        <button class="nav-item" data-view="security" onclick="switchView('security', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>隐私脱敏与代码体检</span>
          </span>
          <span class="nav-counter">10</span>
        </button>

        <button class="nav-item" data-view="worktrees" onclick="switchView('worktrees', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
            <span>Git 隔离沙箱 (Dev)</span>
          </span>
          <span id="navCountWorktrees" class="nav-counter">3</span>
        </button>

        <button class="nav-item" data-view="memory" onclick="switchView('memory', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>长期记忆浓缩库</span>
          </span>
          <span class="nav-counter">68%</span>
        </button>
      </div>

      <div class="attention-budget-box">
        <div class="budget-header">
          <span>人类精力保护槽位</span>
          <strong id="budgetNumeric">1 / 5</strong>
        </div>
        <div id="attentionSlotBar" class="slot-bar"></div>
        <div style="font-size:11px;color:var(--text-muted);line-height:1.4;">
          DeepSeek Super-Agent 准则：常规任务后台静默完成，仅重要风险请您拍板。
        </div>
      </div>
    </aside>

    <!-- MAIN SPLIT WORKBENCH -->
    <main class="workbench">
      <!-- LEFT PRIMARY PANE -->
      <section class="pane-primary">
        <div class="telemetry-strip">
          <div class="metric-cell">
            <div class="metric-label">需您拍板事项 (Attention)</div>
            <div class="metric-val" id="mAttentionVal">1 / 5</div>
            <div class="metric-sub">其余任务均自动在后台静默完成</div>
          </div>
          <div class="metric-cell">
            <div class="metric-label">群聊与通知降噪率</div>
            <div class="metric-val" id="mFilterVal">60%</div>
            <div class="metric-sub" id="mFilterSub">自动过滤无效『收到/OK』</div>
          </div>
          <div class="metric-cell">
            <div class="metric-label">已完成全场景任务</div>
            <div class="metric-val" id="mWorkersVal">4 项任务</div>
            <div class="metric-sub" id="mSilentSub">覆盖小白 · 办公 · 编程</div>
          </div>
          <div class="metric-cell">
            <div class="metric-label">智能缓存节省成本</div>
            <div class="metric-val" id="mSpendVal">$0.0750</div>
            <div class="metric-sub">Auto-Dream 节省 68% Token</div>
          </div>
        </div>

        <!-- ONE-CLICK PRESET CARDS -->
        <div id="presetStrip" class="preset-grid"></div>

        <!-- NATURAL LANGUAGE INPUT BAR -->
        <div class="compose-row">
          <input id="quickTitle" class="mono-input" style="width:200px;" value="整理本周工作周报与待办" placeholder="任务简称..." />
          <input id="quickPrompt" class="mono-input" style="flex:1;" value="把本周群聊和会议重点汇总成清晰的周报表格，并列出下周 3 项优先待办。" placeholder="用大白话告诉超级管家您想做什么（整理文件、写周报、审合同、写代码）..." />
          <button class="btn btn-solid" onclick="dispatchFromBar()">交给超级管家执行</button>
        </div>

        <div id="primaryContent"></div>
      </section>

      <!-- RIGHT ADAPTIVE DELIVERABLE & DIFF INSPECTOR -->
      <section class="pane-inspector">
        <div class="section-bar">
          <span class="section-title">成果预览与安全护盾检视器 (DELIVERABLE & SECURITY INSPECTOR)</span>
          <span class="tag tag-pass">实时同步</span>
        </div>
        <div id="inspectorContent"></div>
      </section>
    </main>

    <!-- BOTTOM STATUS BAR -->
    <footer class="statusbar">
      <div style="display:flex;gap:16px;">
        <span>CLIENT: CC-NEXUS DESKTOP v3.0.0</span>
        <span>ENGINE: DEEPSEEK SUPER-AGENT + CLAUDE 4.5 + OPENAI CODEX</span>
      </div>
      <div style="display:flex;gap:16px;">
        <span>SANDBOX SHIELD: ACTIVE</span>
        <span>SHORTCUT: CTRL+K</span>
      </div>
    </footer>
  </div>

  <!-- COMMAND PALETTE (CTRL+K) -->
  <div id="cmdkModal" class="modal-backdrop hidden" onclick="if(event.target===this)toggleCmdk(false)">
    <div class="cmdk-dialog">
      <input id="cmdkSearch" class="cmdk-input" placeholder="输入指令或选择快捷场景（支持小白 / 办公 / 编程）..." />
      <div class="cmdk-item" onclick="setPersona('beginner');toggleCmdk(false)">
        <span>🌱 切换到【小白管家模式】— 文件归档、旅行规划、零术语安心护盾</span>
        <span class="kbd">MODE 1</span>
      </div>
      <div class="cmdk-item" onclick="setPersona('office');toggleCmdk(false)">
        <span>💼 切换到【智慧办公模式】— 周报生成、群聊降噪、合同隐私脱敏导出</span>
        <span class="kbd">MODE 2</span>
      </div>
      <div class="cmdk-item" onclick="setPersona('developer');toggleCmdk(false)">
        <span>⚡ 切换到【极客编程模式】— Git Worktree 沙箱、Unified Diff、Codex SARIF</span>
        <span class="kbd">MODE 3</span>
      </div>
      <div class="cmdk-item" onclick="injectNoiseEvent();toggleCmdk(false)">
        <span>🔕 模拟飞书/微信群聊『收到』噪音（测试前置零成本过滤）</span>
        <span class="kbd">FILTER</span>
      </div>
      <div class="cmdk-item" onclick="triggerWatchdogHeal();toggleCmdk(false)">
        <span>🛠️ 模拟后台任务卡死并触发 Watchdog 自动恢复</span>
        <span class="kbd">HEAL</span>
      </div>
    </div>
  </div>

  <script>${STUDIO_CLIENT_JS}</script>
</body>
</html>`;
}
