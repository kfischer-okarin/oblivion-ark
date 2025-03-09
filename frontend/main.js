const { app, globalShortcut, BrowserWindow } = require('electron');

app.on('ready', () => {
  globalShortcut.register('Shift+F5', async () => {
    const win = new BrowserWindow({
      width: 640,
      height: 240,
      frame: false,
      webPreferences: {
        devTools: !app.isPackaged,
      }
    });

    await win.loadURL('http://localhost:5173/quick-capture-view.html')
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
