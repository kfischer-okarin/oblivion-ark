import { unlinkSync } from "fs";
import net from "net";
import { basename } from "path";

import { BrowserWindow, ipcMain } from "electron";
import {
  JSONRPCClient,
  JSONRPCErrorException,
  JSONRPCServer,
  JSONRPCServerAndClient,
} from "json-rpc-2.0";

import { triggerGlobalShortcut } from "./globalShortcuts.js";
import { logger } from "./logger.js";

let socketServer;
let notificationClients = [];

/**
 * Creates a Unix socket server that can receive commands to drive the application
 * @param {string} socketPath - Path where the Unix socket should be created
 * @param {object} app - The Electron app instance
 * @returns {object} The created server instance or null if no socket path was provided
 */
export function startDriverSocketServer(socketPath, app) {
  if (socketServer) {
    logger.warn("Driver socket server already running. Doing nothing.");
    return;
  }

  app.on("startup-finished", () => {
    notifyAllClients("startupFinished");
  });

  app.on("browser-window-created", (_, window) => {
    let page;
    window.webContents.on("did-finish-load", () => {
      page = basename(window.webContents.getURL());
    });

    window.on("show", () => {
      notifyAllClients("windowShown", { id: window.id, page });
    });
  });

  socketServer = net.createServer((socket) => {
    logger.info("Driver connected");

    const server = buildJSONRPCServer(socket);

    server.addMethod("triggerGlobalShortcut", ({ accelerator }) =>
      triggerGlobalShortcut(accelerator),
    );

    server.addMethod("enterText", ({ text }) => {
      const window = getFocusedWindow();
      window.webContents.send("enterText", text);

      ipcMain.once("enterTextDone", () => {
        notifyAllClients("enterTextDone");
      });
    });

    notificationClients.push(server);

    socket.on("error", (error) => {
      logger.error("Driver socket error:", error);
    });

    socket.on("close", () => {
      logger.info("Driver disconnected");
    });
  });

  socketServer.on("error", (error) => {
    logger.error(`Driver socket server error: ${error.message}`);

    // If the socket file already exists, try to remove it and retry
    if (error.code === "EADDRINUSE") {
      try {
        unlinkSync(socketPath);
        logger.info(`Removed stale socket at ${socketPath}, retrying...`);
        startDriverSocketServer(socketPath, app);
      } catch (unlinkError) {
        logger.error(`Failed to remove stale socket: ${unlinkError.message}`);
      }
    }
  });

  socketServer.listen(socketPath, () => {
    logger.info(`Driver socket listening at ${socketPath}`);

    // Prepend so it will be before the logger is closed
    app.prependListener("will-quit", () => {
      logger.info("Cleaning up driver socket");
      socketServer.close();
    });
  });
}

function buildJSONRPCServer(socket) {
  const server = new JSONRPCServer();
  const client = new JSONRPCClient((message) => {
    socket.write(JSON.stringify(message));
    socket.write("\n");
  });
  const result = new JSONRPCServerAndClient(server, client);

  socket.on("data", async (data) => {
    try {
      const message = JSON.parse(data.toString());
      logger.info("Received JSON-RPC message:", message);

      await result.receiveAndSend(message);
    } catch (error) {
      logger.error("Error processing JSON-RPC message:", error);
    }
  });

  return result;
}

function notifyAllClients(method, params) {
  notificationClients.forEach((client) => {
    client.notify(method, params);
  });
}

const ERROR_CODES = {
  NO_FOCUSED_WINDOW: -32000,
};

function getFocusedWindow() {
  const window = BrowserWindow.getFocusedWindow();
  if (!window) {
    throw new JSONRPCErrorException(
      "No focused window",
      ERROR_CODES.NO_FOCUSED_WINDOW,
    );
  }
  return window;
}
