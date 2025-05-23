import { dirname, resolve, relative, extname } from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const __dirname = dirname(fileURLToPath(import.meta.url));

const addExtensionIfMissing = (filePath, extension) => {
  if (extname(filePath) !== extension) {
    return `${filePath}${extension}`;
  }
  return filePath;
};

export default defineConfig({
  // Make sure that vite output uses relative paths otherwise it will not work inside a packaged Electron app
  base: "./",
  plugins: [svelte()],
  build: {
    rollupOptions: {
      // Make sure that output files are always at the same location inside dist
      // otherwise Electron will not be able to find them
      output: {
        entryFileNames: (chunk) => {
          const relativePathFromRoot = relative(
            __dirname,
            chunk.facadeModuleId,
          );
          return addExtensionIfMissing(relativePathFromRoot, ".js");
        },
      },
      input: {
        noteCaptureWindow: resolve(__dirname, "src/note-capture-window.html"),
        noteCaptureWindowPreload: resolve(
          __dirname,
          "src/note-capture-window-preload.js",
        ),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    strictPort: true,
    port: 5173,
  },
  test: {
    environment: "happy-dom",
    globals: true,
  },
});
