import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: "src/echo-popup/index.html",
        sidePanel: "src/side-panel-chat-example/index.html",
        imageEdits: "src/image-edits/index.html",
      },
    },
    outDir: "dist",
  },
});
