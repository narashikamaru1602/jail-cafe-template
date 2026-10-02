import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart({
      // Prerender the homepage as a real `dist/client/index.html` containing
      // the actual homepage markup (<h1>, hero, sections, footer).
      // TanStack's SPA shell page below already occupies the plain "/" crawl
      // slot (it writes `_shell.html`, the Firebase rewrite fallback), so the
      // full render is requested via "/?prerender" — same route, same HTML
      // output path (`/index.html`), just a distinct crawl key.
      pages: [{ path: "/?prerender" }],
      spa: {
        enabled: true,
        prerender: {
          outputPath: "/_shell.html",
          crawlLinks: true,
          retryCount: 2,
        },
      },
    }),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
