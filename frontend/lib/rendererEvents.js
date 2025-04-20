export const WindowReadyEvent = {
  logEvents: (ipcMain, logger) => {
    ipcMain.on("windowReady", (_, payload) => {
      logger.info(
        `Received renderer 'windowReady' event: ${JSON.stringify(payload)}`,
      );
    });
  },
  send: (ipcRenderer, payload) => ipcRenderer.send("windowReady", payload),
  addListener: (ipcMain, callback) => ipcMain.on("windowReady", callback),
  removeListener: (ipcMain, callback) =>
    ipcMain.removeListener("windowReady", callback),
  onNextEvent: (ipcMain, callback) => ipcMain.once("windowReady", callback),
};
