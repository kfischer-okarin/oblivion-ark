export const buildMainEvent = (eventName) => ({
  sendToWindow: (window, payload) =>
    window.webContents.send(eventName, payload),
  addListener: (ipcRenderer, callback) => ipcRenderer.on(eventName, callback),
  removeListener: (ipcRenderer, callback) =>
    ipcRenderer.removeListener(eventName, callback),
  onNextEvent: (ipcRenderer, callback) => ipcRenderer.once(eventName, callback),
});

export const MainEvents = {
  // Driver commands
  EnterText: buildMainEvent("enterText"),
  SendKey: buildMainEvent("sendKey"),
};

export const buildRendererEvent = (eventName) => ({
  logEvents: (ipcMain, logger) => {
    ipcMain.on(eventName, (_, payload) => {
      const payloadDetails = payload ? `: ${JSON.stringify(payload)}` : "";
      logger.info(`Received renderer '${eventName}' event${payloadDetails}`);
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
  // Driver events
  EnterTextDone: buildRendererEvent("enterTextDone"),
};

RendererEvents.logEvents = (ipcMain, logger) => {
  Object.values(RendererEvents).forEach((event) => {
    if (typeof event.logEvents === "function") {
      event.logEvents(ipcMain, logger);
    }
  });
};
