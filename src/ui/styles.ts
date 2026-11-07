export const STUDIO_CSS = `
:root {
  --bg-canvas: #09090b;
  --bg-surface: #0e0e11;
  --bg-elevated: #141418;
  --bg-hover: #1a1a20;
  --bg-active: #222229;
  --border-hairline: rgba(255, 255, 255, 0.075);
  --border-strong: rgba(255, 255, 255, 0.15);
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --dot-emerald: #10b981;
  --dot-amber: #f59e0b;
  --dot-crimson: #ef4444;
  --dot-blue: #3b82f6;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background: var(--bg-canvas);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
}

.app-shell {
  display: grid;
  grid-template-columns: 228px 1fr;
  grid-template-rows: 46px 1fr 28px;
  height: 100vh;
  width: 100vw;
}

/* Top Command Header */
.topbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-hairline);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  width: 22px;
  height: 22px;
  border: 1px solid var(--border-strong);
  background: #141418;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  border-radius: 4px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-secondary);
}

.breadcrumb strong {
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.breadcrumb-sep {
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.arch-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 2px 7px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-hairline);
  border-radius: 3px;
  color: var(--text-secondary);
}

.topbar-center {
  display: flex;
  align-items: center;
}

.cmdk-trigger {
  width: 340px;
  height: 28px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-hairline);
  border-radius: 5px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.12s ease;
}

.cmdk-trigger:hover {
  border-color: var(--border-strong);
  color: var(--text-secondary);
}

.kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border: 1px solid var(--border-hairline);
  background: var(--bg-elevated);
  border-radius: 3px;
  color: var(--text-secondary);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.attention-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  padding: 0 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-hairline);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.dot-emerald { background: var(--dot-emerald); box-shadow: 0 0 8px rgba(16, 185, 129, 0.55); }
.dot-amber { background: var(--dot-amber); box-shadow: 0 0 8px rgba(245, 158, 11, 0.55); }
.dot-crimson { background: var(--dot-crimson); box-shadow: 0 0 8px rgba(239, 68, 68, 0.55); }
.dot-blue { background: var(--dot-blue); }

/* Sidebar Navigation Rail */
.sidebar {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-hairline);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px 10px;
  user-select: none;
}

.nav-group-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 8px 10px 6px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  border-radius: 5px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s ease;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--bg-active);
  color: var(--text-primary);
  border-color: var(--border-hairline);
}

.nav-item-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.nav-icon {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-width: 1.6;
  fill: none;
  opacity: 0.85;
}

.nav-counter {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-hairline);
  color: var(--text-secondary);
}

.nav-counter.alert {
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.1);
}

.attention-budget-box {
  background: var(--bg-canvas);
  border: 1px solid var(--border-hairline);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.slot-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.slot-cell {
  height: 5px;
  border-radius: 2px;
  background: #27272a;
}

.slot-cell.used-warn { background: var(--dot-amber); }
.slot-cell.used-crit { background: var(--dot-crimson); }
.slot-cell.free { background: rgba(16, 185, 129, 0.28); }

/* Workbench Split Grid */
.workbench {
  display: grid;
  grid-template-columns: 1.28fr 1fr;
  height: 100%;
  overflow: hidden;
}

.pane-primary {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid var(--border-hairline);
}

.pane-inspector {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-surface);
}

/* Telemetry Ribbon (Swiss Grid Strip) */
.telemetry-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--border-hairline);
  background: var(--bg-surface);
}

.metric-cell {
  padding: 12px 16px;
  border-right: 1px solid var(--border-hairline);
}

.metric-cell:last-child {
  border-right: none;
}

.metric-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.metric-val {
  font-family: var(--font-mono);
  font-size: 19px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.metric-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Section Headers & Action Bars */
.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-hairline);
  background: var(--bg-canvas);
}

.section-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.compose-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-hairline);
  background: var(--bg-surface);
}

.mono-input {
  background: var(--bg-canvas);
  border: 1px solid var(--border-hairline);
  color: var(--text-primary);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-family: var(--font-sans);
}

.mono-input:focus, textarea.code-area:focus {
  outline: none;
  border-color: var(--border-strong);
}

.btn {
  height: 28px;
  padding: 0 11px;
  border-radius: 4px;
  border: 1px solid var(--border-hairline);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.1s ease;
}

.btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

.btn-solid {
  background: #fafafa;
  color: #09090b;
  border-color: #fafafa;
  font-weight: 600;
}

.btn-solid:hover {
  background: #e4e4e7;
}

.btn-approve {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

.btn-reject {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* Swiss Grid Data Rows */
.grid-row {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-hairline);
  cursor: pointer;
  transition: background 0.1s ease;
}

.grid-row:hover {
  background: var(--bg-surface);
}

.grid-row.selected {
  background: var(--bg-elevated);
  border-left: 2px solid #fafafa;
  padding-left: 14px;
}

.row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.row-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.row-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid var(--border-hairline);
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.tag-pass { color: #34d399; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.08); }
.tag-block { color: #f87171; border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.1); }
.tag-warn { color: #fbbf24; border-color: rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.1); }

/* Step Trace Timeline */
.trace-list {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.trace-chip {
  padding: 5px 8px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-hairline);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Right Inspector Code & Diff View */
.inspector-body {
  padding: 16px;
}

.code-frame {
  border: 1px solid var(--border-hairline);
  border-radius: 5px;
  background: #060608;
  font-family: var(--font-mono);
  font-size: 11.5px;
  overflow-x: auto;
  margin-top: 10px;
}

.diff-line {
  display: grid;
  grid-template-columns: 36px 1fr;
  padding: 1px 10px;
  white-space: pre-wrap;
  word-break: break-all;
}

.diff-num {
  color: #52525b;
  user-select: none;
  text-align: right;
  padding-right: 10px;
}

.diff-add { background: rgba(16, 185, 129, 0.1); color: #6ee7b7; }
.diff-del { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
.diff-hunk { background: rgba(59, 130, 246, 0.08); color: #93c5fd; }

textarea.code-area {
  width: 100%;
  min-height: 92px;
  background: #060608;
  border: 1px solid var(--border-hairline);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 11.5px;
  padding: 10px;
  resize: vertical;
}

/* Bottom Status Bar */
.statusbar {
  grid-column: 1 / -1;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-hairline);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-muted);
}

/* Command Palette Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  z-index: 100;
}

.cmdk-dialog {
  width: 540px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.cmdk-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--border-hairline);
  background: transparent;
  color: var(--text-primary);
  padding: 14px 16px;
  font-size: 13.5px;
  font-family: var(--font-sans);
}

.cmdk-input:focus { outline: none; }

.cmdk-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid var(--border-hairline);
}

.cmdk-item:hover {
  background: var(--bg-active);
}

.hidden { display: none !important; }
`;
