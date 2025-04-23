export const buildRendererEvent = (eventName) => ({
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

export const RendererEvents = {
  SubmitNote: buildRendererEvent("submitNote"),
};

RendererEvents.logEvents = (ipcMain, logger) => {
  Object.values(RendererEvents).forEach((event) => {
    if (typeof event.logEvents === "function") {
      event.logEvents(ipcMain, logger);
    }
  });
};
