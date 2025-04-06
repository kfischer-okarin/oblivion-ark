import { app, globalShortcut, BrowserWindow, shell } from "electron";
import { integrateWithViteDevServer } from "./viteDevServer.js";
import { initializeLogger } from "./logger.js";

const settings = {
  quickCaptureKey: "Shift+F5",
};

// Initialize the logger with a custom filename
const logger = initializeLogger();
logger.info("-".repeat(80));
logger.info("Application starting with args:", process.argv);
logger.info("Production Build:", app.isPackaged);

const pageLoader = {
  loadPage: async (window, relativeFilePath) =>
    // dist is the output directory for the Vite build
    window.loadFile(`dist/${relativeFilePath}`),
};

integrateWithViteDevServer(app, pageLoader);

let quickCaptureWindow;

app.commands = {
  quickCapture: () => {
    if (quickCaptureWindow) {
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
