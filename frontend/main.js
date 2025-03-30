import { app, globalShortcut, BrowserWindow, shell } from "electron";

import { integrateWithViteDevServer } from "./viteDevServer.js";

const pageLoader = {
  loadPage: async (window, relativeFilePath) =>
    window.loadFile(relativeFilePath),
};

integrateWithViteDevServer(app, pageLoader);

let quickCaptureWindow;

app.on("ready", () => {
  quickCaptureWindow = new BrowserWindow({
    width: 640,
    height: 240,
    frame: false,
    webPreferences: {
      devTools: !app.isPackaged,
    },
    show: false,
  });

  pageLoader.loadPage(quickCaptureWindow, "quick-capture-view.html");

  quickCaptureWindow.webContents.on("did-finish-load", () => {
    registerGlobalShortcuts();
  });

  quickCaptureWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

function registerGlobalShortcuts() {
  globalShortcut.register("Shift+F5", () => {
    quickCaptureWindow.show();
  });
}
