import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Make sure that vite output uses relative paths otherwise it will not work inside a packaged Electron app
  base: "./",
  build: {
    rollupOptions: {
      input: {
        quickCaptureView: resolve(__dirname, "quick-capture-view.html"),
      },
    },
  },
  server: {
    strictPort: true,
    port: 5173,
  },
});
