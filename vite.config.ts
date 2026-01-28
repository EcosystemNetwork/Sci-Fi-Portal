import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

// Only import Replit plugins if we're on Replit
const replitPlugins = process.env.REPL_ID !== undefined
  ? await Promise.all([
      import("@replit/vite-plugin-runtime-error-modal").then((m) => m.default()),
      ...(process.env.NODE_ENV !== "production"
        ? [
            import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
            import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
          ]
        : []),
    ])
  : [];

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    metaImagesPlugin(),
    ...replitPlugins,
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
