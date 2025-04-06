import fs from "fs";
import path from "path";

import { app } from "electron";
import { DateTime } from "luxon";

/**
 * Initializes and returns a logger with customizable output
 * @param {Object} options - Configuration options
 * @param {string} options.filename - The name of the log file (default: "app.log")
 * @returns {Object} Logger object with info, warn, error, and debug methods
 */
export function initializeLogger({ filename = "app.log" } = {}) {
  const logPath = app.getPath("logs");
  const logFilePath = path.join(logPath, filename);
  const logFile = fs.createWriteStream(logFilePath, { flags: "a" });

  return {
    info: buildLogFunction(logFile, "INFO"),
    warn: buildLogFunction(logFile, "WARN"),
    error: buildLogFunction(logFile, "ERROR"),
    debug: buildLogFunction(logFile, "DEBUG"),
    close: () => logFile.end(),
  };
}

function buildLogFunction(logFile, level) {
  return (...args) => {
    const entry = formatLogEntry(level, ...args);
    logFile.write(entry);
  };
}

function formatLogEntry(level, ...args) {
  const timestamp = DateTime.now().toISO();
  const message = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
    .join(" ");

  // Ensure level always fills the same amount of columns (5 characters)
  const paddedLevel = level.padEnd(5, " ");

  return `${timestamp} ${paddedLevel} ${message}\n`;
}
