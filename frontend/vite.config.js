import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
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
