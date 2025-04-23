export const buildEvent = (eventName) => ({
  logEvents: (ipcMain, logger) => {
    ipcMain.on(eventName, (_, payload) => {
      logger.info(
        `Received renderer '${eventName}' event: ${JSON.stringify(payload)}`,
      );
    });
  },
  send: (ipcRenderer, payload) => ipcRenderer.send(eventName, payload),
  addListener: (ipcMain, callback) => ipcMain.on(eventName, callback),
  removeListener: (ipcMain, callback) =>
    ipcMain.removeListener(eventName, callback),
  onNextEvent: (ipcMain, callback) => ipcMain.once(eventName, callback),
});

export const SubmitNoteEvent = buildEvent("submitNote");
