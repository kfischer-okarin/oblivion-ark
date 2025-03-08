const { app, globalShortcut, BrowserWindow } = require('electron');

let mainWindow;

app.on('ready', () => {
  globalShortcut.register('Shift+F5', async () => {
    const win = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
    });

    await win.loadFile('quick-capture-view.html');
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

console.log('Hello from Electron 👋')