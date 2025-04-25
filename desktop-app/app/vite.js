import { spawn } from "child_process";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function integrateWithVite(app, pageLoader) {
  if (app.isPackaged) {
    // dist is the default output directory for Vite
    pageLoader.loadPage = async (window, pathFromProjectRoot) => {
      await window.loadFile(join("dist", pathFromProjectRoot));
    };
    pageLoader.preloadScriptPath = (pathFromProjectRoot) =>
      resolve(__dirname, "../dist", pathFromProjectRoot);
    return;
  }

  const viteProcess = spawn("npx", ["vite"], {
    shell: true,
    env: {
      ...process.env,
      FORCE_COLOR: "1", // Vite defaults to no color in non-TTY environments
    },
    stdio: [
      "ignore", // stdin
      "pipe", // stdout
      "pipe", // stderr
    ],
  });

  forwardStreamLinesWithPrefix(viteProcess.stdout, LOG_PREFIX, console.log);
  forwardStreamLinesWithPrefix(viteProcess.stderr, LOG_PREFIX, console.error);

  viteProcess.on("error", (error) => {
    console.error(`${LOG_PREFIX} Error starting Vite: ${error}`);
  });

  app.on("will-quit", () => {
    if (viteProcess) {
      viteProcess.kill();
    }
  });

  await waitUntilViteIsReady(viteProcess);

  pageLoader.loadPage = async (window, pathFromProjectRoot) =>
    window.loadURL(`http://localhost:5173/${pathFromProjectRoot}`);
  // TODO: Also hot-reload the preload script
}

const LOG_PREFIX = "\x1b[32m[VITE]\x1b[0m";

function forwardStreamLinesWithPrefix(stream, prefix, lineFn) {
  stream.on("data", (data) => {
    const lines = data.toString().split("\n");
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    lines.forEach((line) => lineFn(`${prefix} ${line}`));
  });
}

function waitUntilViteIsReady(viteProcess) {
  return new Promise((resolve) => {
    const resolveWhenReadyLogWasEmitted = (data) => {
      if (/VITE.+ready/.test(data.toString())) {
        viteProcess.stdout.removeListener(
          "data",
          resolveWhenReadyLogWasEmitted,
        );
        resolve();
      }
    };

    viteProcess.stdout.on("data", resolveWhenReadyLogWasEmitted);
  });
}

export { integrateWithVite };
