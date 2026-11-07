import { STUDIO_CLIENT_JS } from "./client-script.ts";
import { STUDIO_CSS } from "./styles.ts";

export function renderStudioHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CC-Nexus v2.0 — DeepSeek Super-Agent · Claude Code · OpenAI Codex</title>
  <style>${STUDIO_CSS}</style>
</head>
<body>
  <div class="app-shell">
    <!-- TOP COMMAND BAR -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="logo-mark">NX</div>
        <div class="breadcrumb">
          <strong>cc-nexus</strong>
          <span class="breadcrumb-sep">/</span>
          <span>super-agent-control-plane</span>
          <span class="arch-tag">DSH-ROUTER · CLAUDE-4.5 · CODEX-SEC</span>
        </div>
      </div>

      <div class="topbar-center">
        <div class="cmdk-trigger" onclick="toggleCmdk(true)">
          <span>Execute command, dispatch worker, or inspect diff...</span>
          <span class="kbd">⌘K</span>
        </div>
      </div>

      <div class="topbar-right">
        <div class="attention-pill">
          <span class="status-dot dot-emerald"></span>
          <span id="topNoiseText">60% NOISE FILTERED</span>
        </div>
        <div class="attention-pill">
          <span class="status-dot dot-amber"></span>
          <span id="topAttentionText">ATTENTION 1/5 SLOTS</span>
        </div>
      </div>
    </header>

    <!-- LEFT NAVIGATION RAIL -->
    <aside class="sidebar">
      <div>
        <div class="nav-group-label">Super-Agent Core</div>
        <button class="nav-item active" data-view="inbox" onclick="switchView('inbox', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            <span>Attention Inbox</span>
          </span>
          <span id="navCountInbox" class="nav-counter alert">1</span>
        </button>

        <button class="nav-item" data-view="topology" onclick="switchView('topology', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
            <span>Router & Workers</span>
          </span>
          <span id="navCountWorkers" class="nav-counter">2</span>
        </button>

        <button class="nav-item" data-view="events" onclick="switchView('events', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>Event Pre-Filter</span>
          </span>
          <span id="navCountEvents" class="nav-counter">5</span>
        </button>

        <div class="nav-group-label" style="margin-top:12px;">Governance & Isolation</div>
        <button class="nav-item" data-view="worktrees" onclick="switchView('worktrees', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
            <span>Git Worktrees</span>
          </span>
          <span id="navCountWorktrees" class="nav-counter">3</span>
        </button>

        <button class="nav-item" data-view="security" onclick="switchView('security', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Codex Security Gate</span>
          </span>
          <span class="nav-counter">9</span>
        </button>

        <button class="nav-item" data-view="memory" onclick="switchView('memory', this)">
          <span class="nav-item-left">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>Auto-Dream Sync</span>
          </span>
          <span class="nav-counter">68%</span>
        </button>
      </div>

      <div class="attention-budget-box">
        <div class="budget-header">
          <span>HUMAN ATTENTION BUDGET</span>
          <strong id="budgetNumeric">1 / 5</strong>
        </div>
        <div id="attentionSlotBar" class="slot-bar"></div>
        <div style="font-size:10.5px;color:var(--text-muted);line-height:1.35;">
          DeepSeek Super-Agent Policy: Silent background execution unless Codex Gate blocks merge.
        </div>
      </div>
    </aside>

    <!-- MAIN SPLIT WORKBENCH -->
    <main class="workbench">
      <!-- LEFT PRIMARY PANE -->
      <section class="pane-primary">
        <div class="telemetry-strip">
          <div class="metric-cell">
            <div class="metric-label">Attention Load</div>
            <div class="metric-val" id="mAttentionVal">1 / 5</div>
            <div class="metric-sub">Human cognitive slots active</div>
          </div>
          <div class="metric-cell">
            <div class="metric-label">Pre-LLM Filter Ratio</div>
            <div class="metric-val" id="mFilterVal">60%</div>
            <div class="metric-sub" id="mFilterSub">3 of 5 events dropped pre-LLM</div>
          </div>
          <div class="metric-cell">
            <div class="metric-label">Isolated Workers</div>
            <div class="metric-val" id="mWorkersVal">2 Active</div>
            <div class="metric-sub" id="mSilentSub">1 silent auto-merged · 0 Bash violations</div>
          </div>
          <div class="metric-cell">
            <div class="metric-label">FinOps Telemetry</div>
            <div class="metric-val" id="mSpendVal">$0.0580</div>
            <div class="metric-sub">68% Prompt Cache compression</div>
          </div>
        </div>

        <div class="compose-row">
          <input id="quickTitle" class="mono-input" style="width:210px;" value="Implement OAuth2 PKCE Verifier" placeholder="Ticket subject..." />
          <input id="quickPrompt" class="mono-input" style="flex:1;" value="Create strict RFC 7636 PKCE verifier in isolated worktree and verify with OpenAI Codex Security Gate." placeholder="Dispatch intent to Always-On Router..." />
          <button class="btn btn-solid" onclick="dispatchFromBar()">Dispatch via Router</button>
        </div>

        <div id="primaryContent"></div>
      </section>

      <!-- RIGHT CONTEXT & DIFF INSPECTOR -->
      <section class="pane-inspector">
        <div class="section-bar">
          <span class="section-title">WORKTREE DIFF & CODEX SARIF INSPECTOR</span>
          <span class="tag">LIVE SYNC</span>
        </div>
        <div id="inspectorContent"></div>
      </section>
    </main>

    <!-- BOTTOM STATUS BAR -->
    <footer class="statusbar">
      <div style="display:flex;gap:16px;">
        <span>ENGINE: CC-NEXUS v2.0.0</span>
        <span>ROUTER CONSTRAINT: DIRECT_BASH=FALSE</span>
        <span>WATCHDOG: ONLINE (18ms)</span>
      </div>
      <div style="display:flex;gap:16px;">
        <span>CLAUDE.MD ↔ AGENTS.MD: SYNCHRONIZED</span>
        <span>SARIF 2.1.0: ENABLED</span>
      </div>
    </footer>
  </div>

  <!-- COMMAND PALETTE (CMD+K) -->
  <div id="cmdkModal" class="modal-backdrop hidden" onclick="if(event.target===this)toggleCmdk(false)">
    <div class="cmdk-dialog">
      <input id="cmdkSearch" class="cmdk-input" placeholder="Type a Super-Agent command or select action..." />
      <div class="cmdk-item" onclick="dispatchFromBar();toggleCmdk(false)">
        <span>Dispatch New Autonomous Worker Ticket via Router</span>
        <span class="kbd">ENTER</span>
      </div>
      <div class="cmdk-item" onclick="injectNoiseEvent();toggleCmdk(false)">
        <span>Simulate Noisy IM/Bot Event (Test Pre-LLM Deterministic Filter)</span>
        <span class="kbd">FLT</span>
      </div>
      <div class="cmdk-item" onclick="injectSignalEvent();toggleCmdk(false)">
        <span>Simulate P0 GitHub Security Webhook (Spawn Worker)</span>
        <span class="kbd">P0</span>
      </div>
      <div class="cmdk-item" onclick="triggerWatchdogHeal();toggleCmdk(false)">
        <span>Trigger Watchdog Loop Detection & Auto-Heal Reset</span>
        <span class="kbd">WDG</span>
      </div>
      <div class="cmdk-item" onclick="runAutoDreamNow();toggleCmdk(false)">
        <span>Run Auto-Dream Memory Consolidation (CLAUDE.md + AGENTS.md)</span>
        <span class="kbd">DRM</span>
      </div>
    </div>
  </div>

  <script>${STUDIO_CLIENT_JS}</script>
</body>
</html>`;
}
