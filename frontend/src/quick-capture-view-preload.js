// Keep this as CommonJS require since it's injected as external dependency in the renderer process
// and we don't want vite to bundle it
const { contextBridge, ipcRenderer } = require("electron/renderer");

import { WindowReadyEvent } from "../lib/rendererEvents.js";

contextBridge.exposeInMainWorld("electron", {
  notifyWindowIsReady: () => WindowReadyEvent.send(ipcRenderer),
});

ipcRenderer.on("enterText", (_, { text }) => {
  console.log("Received text to enter:", text);

  if (isCodeMirrorEditor(document.activeElement)) {
    simulateTypingInCodeMirrorEditor(text);
  } else {
    throw new Error("Don't know how to enter text in this element");
  }
});

function isCodeMirrorEditor(element) {
  return element.classList.contains("cm-content");
}

function simulateTypingInCodeMirrorEditor(text) {
  let charIndex = 0;
  let lastCharWasNewline = false;

  function typeNextCharacter() {
    // Need to move to next line container that was created by code mirror
    // after entering a newline
    if (lastCharWasNewline) {
      moveCursorToStartOfNextSiblingElement();
    }

    const char = text.charAt(charIndex);
    typeCharacter(char);
    lastCharWasNewline = char === "\n";

    charIndex++;

    if (charIndex < text.length) {
      const typingDelay = 20 + Math.floor(Math.random() * 20);
      setTimeout(typeNextCharacter, typingDelay);
    }
  }

  typeNextCharacter();
}

function typeCharacter(char) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  const textNode = document.createTextNode(char);
  range.insertNode(textNode);

  // Update selection/caret position
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  // Dispatch input event to notify any listeners
  const inputEvent = new Event("input", { bubbles: true });
  document.activeElement.dispatchEvent(inputEvent);
}

function moveCursorToStartOfNextSiblingElement() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const nextLine = range.startContainer.nextSibling;
  if (nextLine) {
    range.setStart(nextLine, 0);
    range.collapse(true);
  }
}
