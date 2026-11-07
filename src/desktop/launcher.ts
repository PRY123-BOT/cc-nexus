import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createNexusServer } from "../server/index.ts";

async function launchDesktopApp(): Promise<void> {
  let serverInstance: ReturnType<typeof createNexusServer>;
  try {
    serverInstance = createNexusServer(Number(process.env.PORT || 4789));
  } catch {
    // Fallback to any available OS port if 4789 is already occupied
    serverInstance = createNexusServer(0);
  }

  const appUrl = `http://127.0.0.1:${serverInstance.server.port}`;

  if (process.env.CC_NEXUS_HEADLESS === "1") {
    console.log(`[CC-Nexus Desktop] Headless Sidecar active at ${appUrl}`);
    return;
  }

  const edgeCandidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ];

  const browserBin = edgeCandidates.find((p) => existsSync(p));
  const userDataDir = join(tmpdir(), "cc-nexus-desktop-shell");

  if (browserBin) {
    const proc = Bun.spawn(
      [
        browserBin,
        `--app=${appUrl}`,
        `--user-data-dir=${userDataDir}`,
        "--window-size=1480,920",
        "--no-first-run",
        "--no-default-browser-check",
      ],
      {
        stdout: "ignore",
        stderr: "ignore",
      }
    );

    await proc.exited;
    serverInstance.server.stop(true);
    process.exit(0);
  } else {
    // Fallback to default OS browser if Edge/Chrome path is non-standard
    Bun.spawn(["cmd", "/c", "start", "", appUrl]);
  }
}

launchDesktopApp();
