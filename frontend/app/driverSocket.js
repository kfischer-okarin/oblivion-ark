import { unlinkSync } from "fs";
import net from "net";

import { BrowserWindow, ipcMain } from "electron";
import {
  JSONRPCServer,
  JSONRPCClient,
  JSONRPCErrorException,
} from "json-rpc-2.0";

import { WindowReadyEvent } from "../lib/rendererEvents.js";
import { logger } from "./logger.js";

let server;
let notificationClients = [];

WindowReadyEvent.addListener(ipcMain, (_, { id }) => {
  notificationClients.forEach((client) => {
    client.notify("windowReady", { id });
  });
});

/**
 * Creates a Unix socket server that can receive commands to drive the application
 * @param {string} socketPath - Path where the Unix socket should be created
 * @param {object} app - The Electron app instance
 * @returns {object} The created server instance or null if no socket path was provided
 */
export function startDriverSocketServer(socketPath, app) {
  if (server) {
    logger.warn("Driver socket server already running. Doing nothing.");
    return;
  }

  const jsonRPCServer = buildJSONRPCServer(app);

  server = net.createServer((socket) => {
    logger.info("Driver connected");
    notificationClients.push(buildJSONRPCClientForNotifications(socket));

    socket.on("data", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        logger.info("Received driver command:", message);

        const response = await jsonRPCServer.receive(message);
        if (response) {
          socket.write(JSON.stringify(response));
          socket.write("\n");
        }
      } catch (error) {
        logger.error("Error processing driver command:", error);
      }
    });

    socket.on("error", (error) => {
      logger.error("Driver socket error:", error);
    });

    socket.on("close", () => {
      logger.info("Driver disconnected");
    });
  });

  server.on("error", (error) => {
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

  server.listen(socketPath, () => {
    logger.info(`Driver socket listening at ${socketPath}`);

    // Prepend so it will be before the logger is closed
    app.prependListener("will-quit", () => {
      logger.info("Cleaning up driver socket");
      server.close();
    });
  });
}

function buildJSONRPCServer(app) {
  const server = new JSONRPCServer();

  server.addMethod("quickCapture", () => {
    app.commands.quickCapture({
      onReady: () => {
        notificationClients.forEach((client) => {
          client.notify("quickCaptureReady");
        });
      },
    });
  });

  server.addMethod("enterText", (text) => {
    const window = getFocusedWindow();
    window.webContents.send("enterText", text);

    ipcMain.once("enterTextDone", () => {
      notificationClients.forEach((client) => {
        client.notify("enterTextDone");
      });
    });
  });

  return server;
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

function buildJSONRPCClientForNotifications(socket) {
  return new JSONRPCClient((message) => {
    socket.write(JSON.stringify(message));
    socket.write("\n");
  });
}
