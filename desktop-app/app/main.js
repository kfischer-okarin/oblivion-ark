import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { app, BrowserWindow, ipcMain, shell } from "electron";

import { RendererEvents, RendererMethods } from "../lib/events.js";
import { parseCliArgs } from "./cliArgs.js";
import { startDriverSocketServer } from "./driverSocket.js";
import {
  registerGlobalShortcut,
  unregisterAllGlobalShortcuts,
} from "./globalShortcuts.js";
import { initializeLogger } from "./logger.js";
import { integrateWithVite } from "./vite.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const cliArgs = parseCliArgs();

const logger = initializeLogger();
logger.info("-".repeat(80));
logger.info("Application starting with args:", cliArgs);
logger.info("Production Build:", app.isPackaged);

RendererEvents.logEvents(ipcMain, logger);

const settings = {
  noteCaptureKey: "Shift+F5",
};

const pageLoader = {
  loadPage: async (window, pathFromProjectRoot) =>
    window.loadFile(pathFromProjectRoot),
  preloadScriptPath: (pathFromProjectRoot) =>
    resolve(__dirname, "..", pathFromProjectRoot),
};

await integrateWithVite(app, pageLoader);

let noteCaptureWindow;
const commonPreloadArguments = {};

if (cliArgs.driverSocketPath) {
  startDriverSocketServer(cliArgs.driverSocketPath, app);
  commonPreloadArguments.driverActive = true;
}

app.commands = {
  startNoteCapture: () => {
    if (noteCaptureWindow) {
      noteCaptureWindow.show();
    }
  },
};

app.on("ready", async () => {
  noteCaptureWindow = await prepareNoteCaptureWindow();

  registerGlobalShortcut(
    settings.noteCaptureKey,
    app.commands.startNoteCapture,
  );
  app.emit("startup-finished");
});

app.on("will-quit", () => {
  unregisterAllGlobalShortcuts();
  logger.info("Application shutting down");
  logger.close();
});

async function prepareNoteCaptureWindow() {
  const window = new BrowserWindow({
    width: 640,
    height: 240,
    frame: false,
    webPreferences: {
      devTools: true,
      preload: pageLoader.preloadScriptPath(
        "src/note-capture-window-preload.js",
      ),
      additionalArguments: additionalRendererArguments(),
    },
    show: false,
  });

  window.on("close", (event) => {
    // Prevent the window from being destroyed
    if (window.isVisible()) {
      event.preventDefault();
      window.hide();
      RendererMethods.ResetWindow.sendToWindow(window, ipcMain, logger);
    }
  });

  openLinksWithDefaultBrowser(window);

  await pageLoader.loadPage(window, "src/note-capture-window.html");

  return window;
}

function openLinksWithDefaultBrowser(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function additionalRendererArguments(values = {}) {
  return [JSON.stringify({ ...commonPreloadArguments, ...values })];
}
