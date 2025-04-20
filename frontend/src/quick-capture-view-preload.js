// Keep this as CommonJS require since it's injected as external dependency in the renderer process
// and we don't want vite to bundle it
const { contextBridge, ipcRenderer } = require("electron/renderer");

import { WindowReadyEvent } from "../lib/rendererEvents.js";
import { defineDriverCommandHandlers } from "./driverCommands.js";

contextBridge.exposeInMainWorld("electron", {
  notifyWindowIsReady: () => WindowReadyEvent.send(ipcRenderer),
});

const argFromMainProcess = JSON.parse(process.argv[process.argv.length - 1]);
if (argFromMainProcess.driverActive) {
  console.log("Connected to driver socket");
  defineDriverCommandHandlers(ipcRenderer);
}
