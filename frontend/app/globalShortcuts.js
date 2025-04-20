import { globalShortcut } from "electron";

const registeredShortcuts = new Map();

export function registerGlobalShortcut(accelerator, callback) {
  if (registeredShortcuts.has(accelerator)) {
    return;
  }

  const success = globalShortcut.register(accelerator, callback);

  if (success) {
    registeredShortcuts.set(accelerator, callback);
  }

  return success;
}

export function unregisterGlobalShortcut(accelerator) {
  if (registeredShortcuts.has(accelerator)) {
    globalShortcut.unregister(accelerator);
    registeredShortcuts.delete(accelerator);
  }
}

export function unregisterAllGlobalShortcuts() {
  globalShortcut.unregisterAll();
  registeredShortcuts.clear();
}
