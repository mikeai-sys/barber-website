import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "api-routes",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, "http://localhost");
          const match = url.pathname.match(/^\/api\/(\w+)/);
          if (!match) return next();
          const route = match[1];
          try {
            const mod = await import(path.resolve("api/" + route + ".js"));
            res.status = function (c) { this.statusCode = c; return this; };
            res.json = function (d) {
              if (!this.headersSent) {
                this.setHeader("Content-Type", "application/json; charset=utf-8");
                this.end(JSON.stringify(d));
              }
            };
            req.query = Object.fromEntries(url.searchParams);
            if (req.method !== "GET") {
              let body = "";
              for await (const chunk of req) body += chunk;
              try { req.body = body ? JSON.parse(body) : {}; } catch { req.body = {}; }
            }
            await mod.default(req, res);
          } catch (e) {
            if (e.code === "ERR_MODULE_NOT_FOUND") return next();
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: e.message }));
            }
          }
        });
      },
    },
  ],
  ssr: {
    noExternal: ["@supabase/supabase-js"],
  },
});
