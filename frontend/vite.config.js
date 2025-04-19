import { dirname, resolve, relative, extname } from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "vite";

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
        quickCaptureView: resolve(__dirname, "src/quick-capture-view.html"),
      },
    },
  },
  server: {
    strictPort: true,
    port: 5173,
  },
});
