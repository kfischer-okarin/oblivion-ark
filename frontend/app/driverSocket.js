import { unlinkSync } from "fs";
import net from "net";

import { logger } from "./logger.js";

let server;

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

  server = net.createServer((socket) => {
    logger.info("Driver connected");

    socket.on("data", (data) => {
      try {
        const message = JSON.parse(data.toString());
        logger.info("Received driver command:", message);

        handleDriverCommand(message, app);
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
