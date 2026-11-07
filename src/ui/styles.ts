export const STUDIO_CSS = `
:root {
  --bg-canvas: #09090b;
  --bg-surface: #0f1014;
  --bg-elevated: #16171d;
  --bg-card: #13141a;
  --bg-hover: #1c1e26;
  --bg-active: #242731;
  --border-hairline: rgba(255, 255, 255, 0.075);
  --border-subtle: rgba(255, 255, 255, 0.11);
  --border-strong: rgba(255, 255, 255, 0.2);
  --specular-top: inset 0 1px 0 0 rgba(255, 255, 255, 0.07);
  --text-primary: #f8fafc;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --dot-emerald: #10b981;
  --dot-amber: #f59e0b;
  --dot-crimson: #ef4444;
  --dot-blue: #3b82f6;
  --accent-primary: #6366f1;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Custom sleek scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.24);
}

html, body {
  height: 100%;
  background: var(--bg-canvas);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
}

.app-shell {
  display: grid;
  grid-template-columns: 236px 1fr;
  grid-template-rows: 52px 1fr 28px;
  height: 100vh;
  width: 100vw;
}

/* Top Command Header */
.topbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: linear-gradient(180deg, #13141a 0%, #0e0f13 100%);
  border-bottom: 1px solid var(--border-hairline);
  box-shadow: var(--specular-top);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  width: 26px;
  height: 26px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: linear-gradient(135deg, #1e2029 0%, #0f1015 100%);
  box-shadow: var(--specular-top), 0 2px 8px rgba(0, 0, 0, 0.4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  border-radius: 6px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.breadcrumb strong {
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Segmented Persona Switcher */
.persona-segmented {
  display: inline-flex;
  background: #08080a;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 3px;
  gap: 3px;
}

.persona-btn {
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.persona-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.persona-btn.active {
  background: var(--bg-active);
  color: var(--text-primary);
  font-weight: 600;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: var(--specular-top), 0 2px 6px rgba(0, 0, 0, 0.45);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attention-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 11px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-hairline);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  box-shadow: var(--specular-top);
}

.kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-canvas);
  border-radius: 4px;
  color: var(--text-secondary);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.dot-emerald { background: var(--dot-emerald); box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }
.dot-amber { background: var(--dot-amber); box-shadow: 0 0 8px rgba(245, 158, 11, 0.6); }
.dot-crimson { background: var(--dot-crimson); box-shadow: 0 0 8px rgba(239, 68, 68, 0.6); }
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
  padding: 10px 10px 6px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  margin-bottom: 2px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.12s ease;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--bg-active);
  color: var(--text-primary);
  border-color: var(--border-subtle);
  box-shadow: var(--specular-top);
}

.nav-item-left {
  display: flex;
  align-items: center;
  gap: 9px;
  white-space: nowrap;
}

.nav-icon {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-width: 1.65;
  fill: none;
  opacity: 0.85;
  flex-shrink: 0;
}

.nav-counter {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-hairline);
  color: var(--text-secondary);
}

.nav-counter.alert {
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
}

.attention-budget-box {
  background: linear-gradient(180deg, #13141a 0%, #0b0c0f 100%);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--specular-top);
  border-radius: 8px;
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
  gap: 5px;
  margin-bottom: 8px;
}

.slot-cell {
  height: 5px;
  border-radius: 99px;
  background: #27272a;
}

.slot-cell.used-crit { background: var(--dot-crimson); box-shadow: 0 0 6px rgba(239, 68, 68, 0.5); }
.slot-cell.free { background: rgba(16, 185, 129, 0.32); }

/* Workbench Split Grid */
.workbench {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
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

/* Telemetry Ribbon */
.telemetry-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid var(--border-hairline);
  background: var(--bg-surface);
}

.metric-cell {
  padding: 12px 16px;
  border-right: 1px solid var(--border-hairline);
  min-width: 0;
}

.metric-cell:last-child { border-right: none; }

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
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.metric-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Quick Preset Template Strip */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-hairline);
  background: var(--bg-canvas);
}

.preset-card {
  min-width: 0;
  padding: 10px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-hairline);
  border-radius: 7px;
  box-shadow: var(--specular-top);
  cursor: pointer;
  transition: all 0.14s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.preset-card:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.preset-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.preset-title span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preset-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.38;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-hairline);
  background: var(--bg-canvas);
  position: sticky;
  top: 0;
  z-index: 5;
}

.section-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}

.compose-row {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-hairline);
  background: var(--bg-surface);
  align-items: center;
}

.mono-input {
  height: 32px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 0 11px;
  border-radius: 6px;
  font-size: 12px;
  font-family: var(--font-sans);
  transition: border-color 0.12s ease;
}

.mono-input:focus, textarea.code-area:focus {
  outline: none;
  border-color: var(--text-primary);
}

.btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  box-shadow: var(--specular-top);
  color: var(--text-primary);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.12s ease;
}

.btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

.btn:active {
  transform: scale(0.98);
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
  border-color: rgba(16, 185, 129, 0.45);
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
}

.btn-approve:hover {
  background: rgba(16, 185, 129, 0.24);
}

.btn-reject {
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.14);
  color: #f87171;
}

.btn-reject:hover {
  background: rgba(239, 68, 68, 0.24);
}

/* Task List Rows */
.grid-row {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border-hairline);
  cursor: pointer;
  transition: background 0.12s ease;
}

.grid-row:hover {
  background: rgba(255, 255, 255, 0.02);
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
  gap: 10px;
  margin-bottom: 6px;
}

.row-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
  min-width: 0;
}

.row-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid var(--border-hairline);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-pass { color: #34d399; border-color: rgba(16, 185, 129, 0.35); background: rgba(16, 185, 129, 0.1); }
.tag-block { color: #f87171; border-color: rgba(239, 68, 68, 0.38); background: rgba(239, 68, 68, 0.12); }
.tag-warn { color: #fbbf24; border-color: rgba(245, 158, 11, 0.38); background: rgba(245, 158, 11, 0.12); }
.tag-blue { color: #93c5fd; border-color: rgba(59, 130, 246, 0.35); background: rgba(59, 130, 246, 0.12); }

.trace-list {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.trace-chip {
  padding: 4px 8px;
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

/* Inspector & Rich Document Formatting */
.inspector-body {
  padding: 18px;
}

.approval-card {
  padding: 13px 15px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.09) 0%, rgba(239, 68, 68, 0.03) 100%);
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.shield-banner {
  padding: 10px 14px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.06);
  border-radius: 6px;
  font-size: 12px;
  color: #6ee7b7;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.doc-card {
  border: 1px solid var(--border-subtle);
  background: linear-gradient(180deg, #111217 0%, #0b0c10 100%);
  box-shadow: var(--specular-top);
  border-radius: 8px;
  padding: 20px 22px;
  margin-top: 12px;
  color: #e4e4e7;
  font-size: 13px;
  line-height: 1.7;
}

.doc-card h1 {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-hairline);
}

.doc-card h2 {
  font-size: 14px;
  font-weight: 600;
  color: #f4f4f5;
  margin: 16px 0 8px;
}

.doc-card blockquote {
  border-left: 3px solid #6366f1;
  background: rgba(99, 102, 241, 0.08);
  padding: 8px 12px;
  border-radius: 0 5px 5px 0;
  color: #c7d2fe;
  font-size: 12px;
  margin: 8px 0 12px;
}

.doc-card ul, .doc-card ol {
  padding-left: 18px;
  margin: 6px 0 12px;
}

.doc-card li {
  margin-bottom: 5px;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0 14px;
  font-size: 12px;
}

.doc-table th, .doc-table td {
  border: 1px solid var(--border-subtle);
  padding: 7px 10px;
  text-align: left;
}

.doc-table th {
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-weight: 600;
}

.code-frame {
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: #060608;
  font-family: var(--font-mono);
  font-size: 11.5px;
  overflow-x: auto;
  margin-top: 10px;
}

.diff-line {
  display: grid;
  grid-template-columns: 36px 1fr;
  padding: 1.5px 10px;
  white-space: pre-wrap;
  word-break: break-all;
}

.diff-num {
  color: #52525b;
  user-select: none;
  text-align: right;
  padding-right: 10px;
}

.diff-add { background: rgba(16, 185, 129, 0.11); color: #6ee7b7; }
.diff-del { background: rgba(239, 68, 68, 0.11); color: #fca5a5; }
.diff-hunk { background: rgba(59, 130, 246, 0.09); color: #93c5fd; }

textarea.code-area {
  width: 100%;
  min-height: 96px;
  background: #060608;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 11.5px;
  padding: 10px;
  resize: vertical;
}

/* Toast Notification */
.toast-container {
  position: fixed;
  bottom: 40px;
  right: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  box-shadow: var(--specular-top), 0 12px 32px rgba(0, 0, 0, 0.65);
  color: var(--text-primary);
  padding: 10px 14px;
  border-radius: 7px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  animation: slideUp 0.18s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.statusbar {
  grid-column: 1 / -1;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-hairline);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-muted);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  z-index: 100;
}

.cmdk-dialog {
  width: 560px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.7);
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
  padding: 11px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid var(--border-hairline);
}

.cmdk-item:hover { background: var(--bg-active); }

.hidden { display: none !important; }
`;
