const { app, BrowserWindow } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");

let sidecarProcess = null;

function createMainWindow(port = 4789) {
  const win = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: "#09090b",
    title: "CC-Nexus Desktop v3.0 — Super-Agent Workstation",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(`http://127.0.0.1:${port}`);
}

app.whenReady().then(() => {
  const serverEntry = path.join(__dirname, "..", "src", "server", "index.ts");
  sidecarProcess = spawn("bun", ["run", serverEntry], {
    stdio: "ignore",
    windowsHide: true,
  });

  setTimeout(() => createMainWindow(4789), 600);
});

app.on("window-all-closed", () => {
  if (sidecarProcess) {
    sidecarProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
