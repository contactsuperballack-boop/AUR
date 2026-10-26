import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// On Vercel the canonical origin is derived automatically (production domain on production
// builds, the deployment URL on previews) unless VITE_SITE_URL is set explicitly in the project
// settings. Elsewhere VITE_SITE_URL / .env is used as before.
const vercelOrigin = process.env.VERCEL
  ? process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined
  : undefined;
const siteUrl = process.env.VITE_SITE_URL || vercelOrigin;

export default defineConfig({
  define: siteUrl ? { "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl) } : undefined,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  // The prerender build (`vite build --ssr`) bundles dependencies instead of leaving them as
  // bare imports, which sidesteps CJS/ESM interop problems when Node loads the SSR output.
  ssr: { noExternal: true },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    // In dev, Vite serves the SPA on :3000 and the Express API runs separately on :3001
    // (see `pnpm dev:server`). This proxy makes the browser see one origin, so the app
    // never needs CORS in development — matching production, where one Express process
    // serves both the built SPA and /api from the same origin.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
