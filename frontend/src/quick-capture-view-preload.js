// Keep this as CommonJS require since it's injected as external dependency in the renderer process
// and we don't want vite to bundle it
const { contextBridge, ipcRenderer } = require("electron/renderer");

import { WindowReadyEvent } from "../lib/rendererEvents.js";

contextBridge.exposeInMainWorld("electron", {
  notifyWindowIsReady: () => WindowReadyEvent.send(ipcRenderer),
});

function simulateTypingInContentEditable(text) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  let charIndex = 0;
  let lastCharWasNewline = false;

  function typeNextCharacter() {
    if (lastCharWasNewline) {
      const nextLine = range.startContainer.nextSibling;
      if (nextLine) {
        range.setStart(nextLine, 0);
        range.collapse(true);
      }
    }

    const char = text.charAt(charIndex);
    lastCharWasNewline = char === "\n";
    const textNode = document.createTextNode(char);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    const inputEvent = new Event("input", { bubbles: true });
    document.activeElement.dispatchEvent(inputEvent);

    charIndex++;

    if (charIndex < text.length) {
      const typingDelay = 20 + Math.floor(Math.random() * 20);
      setTimeout(typeNextCharacter, typingDelay);
    }
  }

  typeNextCharacter();
}
