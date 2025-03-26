import { app, globalShortcut, BrowserWindow, shell } from 'electron';

import { integrateWithViteDevServer } from './viteDevServer.js';

const viteDevServer = integrateWithViteDevServer(app);

let quickCaptureWindow;

app.on('ready', () => {
  quickCaptureWindow = new BrowserWindow({
    width: 640,
    height: 240,
    frame: false,
    webPreferences: {
      devTools: !app.isPackaged,
    },
    show: false,
  });
  // TODO: Do this smarter
  if (app.isPackaged) {
    quickCaptureWindow.loadFile('quick-capture-view.html');
  } else {
    viteDevServer.once('ready', () => {
      quickCaptureWindow.loadURL('http://localhost:5173/quick-capture-view.html');
    });
  }
  quickCaptureWindow.webContents.on('did-finish-load', () => {
    registerGlobalShortcuts();
  });

  quickCaptureWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

function registerGlobalShortcuts() {
  globalShortcut.register('Shift+F5', () => {
    quickCaptureWindow.show();
  });
}
