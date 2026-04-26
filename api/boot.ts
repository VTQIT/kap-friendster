import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.post("/api/upload", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const file = body.file as File | undefined;
  if (!file) return c.json({ error: "No file provided" }, 400);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  mkdirSync(uploadsDir, { recursive: true });
  const ext = path.extname(file.name) || ".bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(path.join(uploadsDir, filename), buffer);
  return c.json({ url: `/uploads/${filename}` });
});

app.use("/uploads/*", async (c, next) => {
  // In dev, Vite handles public/; in prod, serve from public/
  if (env.isProduction) {
    const { serveStatic } = await import("@hono/node-server/serve-static");
    return serveStatic({ root: "./public" })(c, next);
  }
  return next();
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
