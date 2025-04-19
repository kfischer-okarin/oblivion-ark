import { spawn } from "child_process";
import { EventEmitter } from "events";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const LOG_PREFIX = "\x1b[32m[VITE]\x1b[0m";

function logWithPrefixBeforeEachLine(string, logFn) {
  const lines = string.toString().split("\n");
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  lines.forEach((line) => logFn(`${LOG_PREFIX} ${line}`));
}

function integrateWithVite(app, pageLoader) {
  if (app.isPackaged) {
    // dist is the default output directory for Vite
    pageLoader.loadPage = async (window, pathFromProjectRoot) => {
      await window.loadFile(join("dist", pathFromProjectRoot));
    };
    pageLoader.preloadScriptPath = (pathFromProjectRoot) =>
      resolve(__dirname, "../dist", pathFromProjectRoot);
    return;
  }

  const emitter = new EventEmitter();
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

  viteProcess.stdout.on("data", (data) => {
    const output = data.toString();
    logWithPrefixBeforeEachLine(output, console.log);

    if (/VITE.+ready/.test(output)) {
      emitter.emit("ready");
    }
  });

  viteProcess.stderr.on("data", (data) => {
    logWithPrefixBeforeEachLine(data, console.error);
  });

  viteProcess.on("error", (error) => {
    console.error(`${LOG_PREFIX} Error starting Vite: ${error}`);
  });

  app.on("will-quit", () => {
    if (viteProcess) {
      viteProcess.kill();
    }
  });

  pageLoader.loadPage = async (window, pathFromProjectRoot) => {
    emitter.once("ready", () => {
      window.loadURL(`http://localhost:5173/${pathFromProjectRoot}`);
    });
  };
  // TODO: Also hot-reload the preload script

  return emitter;
}

export { integrateWithVite };
