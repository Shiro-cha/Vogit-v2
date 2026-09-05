import { FileController } from "./controllers/FileController";
import { mapErrorToStatus } from "./errorMapper";
import { createFacade } from "../../infrastructure/repository/RepositoryFactory";

/**
 * Minimal REST API for Vogit's MVP, built directly on Bun.serve.
 * Routes are intentionally simple (regex matching) - if the surface
 * grows, this is the place to introduce a router library, without
 * touching the domain/application/infrastructure layers.
 *
 * Endpoints:
 *   POST   /files                        add a file
 *   GET    /files                        list files
 *   GET    /files/:id                    get a file
 *   PUT    /files/:id                    update a file (new version)
 *   POST   /files/:id/versions           create a new version
 *   GET    /files/:id/versions           list versions
 *   GET    /files/:id/versions/:version  get a version (?content=true)
 *   POST   /files/:id/restore/:version   restore a version
 */
export async function createServer(port = Number(process.env.PORT) || 3000) {
    const facade = await createFacade();
    const controller = new FileController(facade);

    const json = (data: unknown, status = 200) =>
        new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

    const routes: Array<{ method: string; pattern: RegExp; handler: (req: Request, m: RegExpMatchArray) => Promise<unknown> }> = [
        { method: "POST", pattern: /^\/files$/, handler: async req => controller.addFile(await req.json().catch(() => undefined)) },
        { method: "GET", pattern: /^\/files$/, handler: async () => controller.listFiles() },
        { method: "GET", pattern: /^\/files\/([^/]+)$/, handler: async (_r, m) => controller.getFile(m[1]) },
        { method: "PUT", pattern: /^\/files\/([^/]+)$/, handler: async (req, m) => controller.updateFile(m[1], await req.json().catch(() => undefined)) },
        { method: "POST", pattern: /^\/files\/([^/]+)\/versions$/, handler: async (req, m) => controller.createVersion(m[1], await req.json().catch(() => undefined)) },
        { method: "GET", pattern: /^\/files\/([^/]+)\/versions$/, handler: async (_r, m) => controller.listVersions(m[1]) },
        {
            method: "GET",
            pattern: /^\/files\/([^/]+)\/versions\/([^/]+)$/,
            handler: async (req, m) => controller.getVersion(m[1], m[2], new URL(req.url).searchParams.get("content") === "true"),
        },
        { method: "POST", pattern: /^\/files\/([^/]+)\/restore\/([^/]+)$/, handler: async (_r, m) => controller.restoreVersion(m[1], m[2]) },
    ];

    const server = Bun.serve({
        port,
        async fetch(req) {
            const url = new URL(req.url);
            if (url.pathname === "/health") {
                return json({ status: "ok" });
            }

            const route = routes.find(r => r.method === req.method && r.pattern.test(url.pathname));
            if (!route) {
                return json({ error: "Not found" }, 404);
            }

            try {
                const match = url.pathname.match(route.pattern)!;
                const result = await route.handler(req, match);
                return json(result, req.method === "POST" ? 201 : 200);
            } catch (error) {
                const { status, message } = mapErrorToStatus(error);
                return json({ error: message }, status);
            }
        },
    });

    console.log(`Vogit API listening on http://localhost:${server.port}`);
    return server;
}

if (import.meta.main) {
    createServer();
}
