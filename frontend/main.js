import { app, globalShortcut, BrowserWindow } from 'electron';

import { integrateWithViteDevServer } from './viteDevServer.js';

integrateWithViteDevServer(app);

app.on('ready', () => {
  registerGlobalShortcuts();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

function registerGlobalShortcuts() {
  globalShortcut.register('Shift+F5', async () => {
    const win = new BrowserWindow({
      width: 640,
      height: 240,
      frame: false,
      webPreferences: {
        devTools: !app.isPackaged,
      }
    });

    // TODO: Do this smarter
    if (app.isPackaged) {
      await win.loadFile('quick-capture-view.html');
    } else {
      await win.loadURL('http://localhost:5173/quick-capture-view.html');
    }
  });
}
