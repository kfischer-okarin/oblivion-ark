import { app, globalShortcut, BrowserWindow, shell } from "electron";

import { parseCliArgs } from "./cliArgs.js";
import { initializeLogger } from "./logger.js";
import { integrateWithVite } from "./vite.js";
import { startDriverSocketServer } from "./driverSocket.js";

const cliArgs = parseCliArgs();

const logger = initializeLogger();
logger.info("-".repeat(80));
logger.info("Application starting with args:", cliArgs);
logger.info("Production Build:", app.isPackaged);

const settings = {
  quickCaptureKey: "Shift+F5",
};

const pageLoader = {
  loadPage: async (window, relativeFilePath) =>
    window.loadFile(relativeFilePath),
};

integrateWithVite(app, pageLoader);

let quickCaptureWindow;

if (cliArgs.driverSocketPath) {
  startDriverSocketServer(cliArgs.driverSocketPath, app);
}

app.commands = {
  quickCapture: ({ onReady } = {}) => {
    if (quickCaptureWindow) {
      if (onReady) {
        quickCaptureWindow.once("focus", onReady);
      }
      quickCaptureWindow.show();
    }
  },
};

app.on("ready", () => {
  quickCaptureWindow = prepareQuickCaptureWindow();

  quickCaptureWindow.webContents.on("did-finish-load", () => {
    globalShortcut.register(
      settings.quickCaptureKey,
      app.commands.quickCapture,
    );
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  logger.info("Application shutting down");
  logger.close();
});

function prepareQuickCaptureWindow() {
  const window = new BrowserWindow({
    width: 640,
    height: 240,
    frame: false,
    webPreferences: {
      devTools: true,
    },
    show: false,
  });
  openLinksWithDefaultBrowser(window);

  pageLoader.loadPage(window, "src/quick-capture-view.html");

  return window;
}

function openLinksWithDefaultBrowser(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}
