const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electron", {
  notifyWindowIsReady: () => ipcRenderer.send("windowReady"),
});
