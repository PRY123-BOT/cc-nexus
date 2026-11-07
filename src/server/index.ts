import { SwarmOrchestrator } from "../core/orchestrator.ts";
import { renderStudioHtml } from "../ui/studio.ts";

export function createNexusServer(port = Number(process.env.PORT || 4789)) {
  const orchestrator = new SwarmOrchestrator();

  const server = Bun.serve<{ clientId: string }>({
    port,
    async fetch(req, srv) {
      const url = new URL(req.url);

      if (url.pathname === "/ws") {
        const upgraded = srv.upgrade(req, {
          data: { clientId: `client-${Date.now()}` },
        });
        if (upgraded) return undefined;
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      const corsHeaders = {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type",
      };

      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (url.pathname === "/" || url.pathname === "/studio") {
        return new Response(renderStudioHtml(), {
          headers: {
            "content-type": "text/html; charset=utf-8",
            ...corsHeaders,
          },
        });
      }

      if (url.pathname === "/api/status" && req.method === "GET") {
        return Response.json(
          {
            service: "cc-nexus",
            version: "1.0.0",
            providers: orchestrator.adapter.getProviderStatus(),
            tasks: orchestrator.listTasks(),
            worktrees: orchestrator.worktrees.listSandboxes(),
            mcp: orchestrator.mcpHub.listServers(),
            dream: orchestrator.memoryDream.runAutoDream(),
            finops: orchestrator.getFinOpsSummary(),
          },
          { headers: corsHeaders }
        );
      }

      if (url.pathname === "/api/tasks" && req.method === "GET") {
        return Response.json(orchestrator.listTasks(), { headers: corsHeaders });
      }

      if (url.pathname === "/api/tasks" && req.method === "POST") {
        const body = (await req.json()) as { title?: string; prompt?: string };
        const task = await orchestrator.runSwarmTask(
          body.title || "Autonomous Feature Task",
          body.prompt || "Implement feature with Claude + Codex verification"
        );
        return Response.json(task, { status: 201, headers: corsHeaders });
      }

      if (url.pathname === "/api/security/audit" && req.method === "POST") {
        const body = (await req.json()) as {
          content?: string;
          targetType?: "diff" | "command" | "file";
          sarif?: boolean;
        };
        const report = orchestrator.securityGate.auditContent(
          body.content || "",
          body.targetType || "diff"
        );
        if (body.sarif) {
          return Response.json(orchestrator.securityGate.toSarif(report), {
            headers: corsHeaders,
          });
        }
        return Response.json(report, { headers: corsHeaders });
      }

      if (url.pathname === "/api/memory/dream" && req.method === "POST") {
        const result = orchestrator.memoryDream.runAutoDream();
        return Response.json(result, { headers: corsHeaders });
      }

      if (url.pathname === "/api/mcp/toggle" && req.method === "POST") {
        const body = (await req.json()) as { id?: string };
        const updated = orchestrator.mcpHub.toggleServer(body.id || "");
        return Response.json(
          { updated, mcpConfig: orchestrator.mcpHub.exportClaudeMcpConfig() },
          { headers: corsHeaders }
        );
      }

      if (url.pathname === "/api/remote/approve" && req.method === "POST") {
        const body = (await req.json()) as {
          taskId?: string;
          decision?: "approve" | "reject";
        };
        const resolved = orchestrator.resolveApproval(
          body.taskId || "",
          body.decision || "approve"
        );
        return Response.json({ task: resolved }, { headers: corsHeaders });
      }

      return Response.json(
        { error: "Not Found", path: url.pathname },
        { status: 404, headers: corsHeaders }
      );
    },
    websocket: {
      open(ws) {
        ws.send(
          JSON.stringify({
            type: "welcome",
            service: "cc-nexus-sidecar",
            timestamp: new Date().toISOString(),
          })
        );
      },
      message(ws, message) {
        ws.send(
          JSON.stringify({
            type: "ack",
            received: String(message),
            timestamp: new Date().toISOString(),
          })
        );
      },
    },
  });

  return { server, orchestrator };
}

if (import.meta.main) {
  const port = Number(process.env.PORT || 4789);
  const { server } = createNexusServer(port);
  console.log(
    `\n🚀 CC-Nexus Studio Sidecar listening on http://localhost:${server.port}`
  );
}
