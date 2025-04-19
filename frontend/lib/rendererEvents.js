export const WindowReadyEvent = {
  logEvents: (ipcMain, logger) => {
    ipcMain.on("windowReady", () => {
      logger.info("Received renderer event: windowReady");
    });
  },
  send: (ipcRenderer) => ipcRenderer.send("windowReady"),
  addListener: (ipcMain, callback) => ipcMain.on("windowReady", callback),
  removeListener: (ipcMain, callback) =>
    ipcMain.removeListener("windowReady", callback),
  onNextEvent: (ipcMain, callback) => ipcMain.once("windowReady", callback),
};
