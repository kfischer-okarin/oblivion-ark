const buildRendererMethod = (methodName) => {
  const responseEventName = `${methodName}Response`;

  return {
    sendToWindow: (window, ipcMain, logger, payload) => {
      const { promise, resolve, reject } = Promise.withResolvers();

      const timeout = setTimeout(() => {
        logger.error(
          `Timeout waiting for ${methodName} response. Payload: ${JSON.stringify(
            payload,
          )}`,
        );
        reject(new Error(`Timeout waiting for ${methodName} response`));
      }, 10000);

      ipcMain.once(responseEventName, (_, response) => {
        clearTimeout(timeout);

        if (response.error) {
          logger.error(`${methodName} reponded with error: ${response.error}`);
          reject(response.error);
        } else {
          const responseDetails = response.result
            ? `: ${JSON.stringify(response.result)}`
            : "";
          logger.info(`Received response for ${methodName}${responseDetails}`);
          resolve(response.result);
        }
      });

      window.webContents.send(methodName, payload);

      return promise;
    },
    handleWith: (ipcRenderer, handler) => {
      ipcRenderer.on(methodName, async (_, payload) => {
        try {
          const result = await handler(payload);
          ipcRenderer.send(responseEventName, { result });
        } catch (error) {
          ipcRenderer.send(responseEventName, { error: error.message });
        }
      });
    },
  };
};

export const RendererMethods = {
  ResetWindow: buildRendererMethod("resetWindow"),
  // Driver commands
  EnterText: buildRendererMethod("enterText"),
  SendKey: buildRendererMethod("sendKey"),
  GetTextFieldContent: buildRendererMethod("getTextFieldContent"),
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
