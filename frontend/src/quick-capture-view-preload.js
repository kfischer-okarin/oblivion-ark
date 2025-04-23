// Keep this as CommonJS require since it's injected as external dependency in the renderer process
// and we don't want vite to bundle it
const { contextBridge, ipcRenderer } = require("electron/renderer");

import { defineDriverCommandHandlers } from "./driverCommands.js";

const { driverActive } = JSON.parse(process.argv[process.argv.length - 1]);

contextBridge.exposeInMainWorld("OblivionArk", {});

if (driverActive) {
  console.log("Connected to driver socket");
  defineDriverCommandHandlers(ipcRenderer);
}
