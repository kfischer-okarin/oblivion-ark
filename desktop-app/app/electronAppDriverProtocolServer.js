// This file is auto-generated. Do not edit it manually.
// Generated from OpenRPC spec at desktop-app/driver.openrpc.json

/**
 * Builds an RPC server with methods and notification functions
 * @param {JSONRPCServerAndClient} server - JSON-RPC server and client
 * @param {Object} handlers - Handler implementations for RPC methods
 * @returns {Object} Object with notification methods
 */
export function buildElectronAppDriverProtocolServer(server, handlers) {
  if (typeof handlers.handleTriggerGlobalShortcut !== "function") {
    throw new Error("Missing handler: handleTriggerGlobalShortcut");
  }
  server.addMethod(
    "triggerGlobalShortcut",
    handlers.handleTriggerGlobalShortcut,
  );
  if (typeof handlers.handleEnterText !== "function") {
    throw new Error("Missing handler: handleEnterText");
  }
  server.addMethod("enterText", handlers.handleEnterText);
  if (typeof handlers.handleSendKey !== "function") {
    throw new Error("Missing handler: handleSendKey");
  }
  server.addMethod("sendKey", handlers.handleSendKey);
  if (typeof handlers.handleResetApplication !== "function") {
    throw new Error("Missing handler: handleResetApplication");
  }
  server.addMethod("resetApplication", handlers.handleResetApplication);
  if (typeof handlers.handleGetTextFieldContent !== "function") {
    throw new Error("Missing handler: handleGetTextFieldContent");
  }
  server.addMethod("getTextFieldContent", handlers.handleGetTextFieldContent);

  return {
    notifyStartupFinished() {
      server.notify("startupFinished");
    },
    notifyWindowShown(id, page) {
      server.notify("windowShown", { id, page });
    },
  };
}
