import { MainEvents, RendererEvents } from "../lib/events";

export function defineDriverCommandHandlers(ipcRenderer) {
  MainEvents.EnterText.addListener(ipcRenderer, async (_, text) => {
    console.log("Received text to enter:", text);

    if (isCodeMirrorEditor(document.activeElement)) {
      await simulateTypingInCodeMirrorEditor(text);
      RendererEvents.EnterTextDone.send(ipcRenderer);
    } else {
      throw new Error("Don't know how to enter text in this element");
    }
  });

  MainEvents.SendKey.addListener(ipcRenderer, (_, keyString) => {
    console.log("Received key to send:", keyString);

    const keyParts = keyString.split("+");
    const key = keyParts[keyParts.length - 1];
    const modifierStrings = keyParts.slice(0, -1);

    // Initialize modifier flags
    const modifiers = {
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
    };

    const duplicateModifierError = new Error(
      `Duplicate modifier in key: ${keyString}`,
    );
    for (const mod of modifierStrings) {
      const lowerMod = mod.toLowerCase();

      // Set the appropriate modifier flag
      if (["cmd", "command", "meta"].includes(lowerMod)) {
        if (modifiers.metaKey) {
          throw duplicateModifierError;
        }
        modifiers.metaKey = true;
      } else if (["ctrl", "control"].includes(lowerMod)) {
        if (modifiers.ctrlKey) {
          throw duplicateModifierError;
        }
        modifiers.ctrlKey = true;
      } else if (["alt", "option"].includes(lowerMod)) {
        if (modifiers.altKey) {
          throw duplicateModifierError;
        }
        modifiers.altKey = true;
      } else if (["shift"].includes(lowerMod)) {
        if (modifiers.shiftKey) {
          throw duplicateModifierError;
        }
        modifiers.shiftKey = true;
      } else {
        throw new Error(`Unknown modifier: ${mod}`);
      }
    }

    // Create and dispatch the keyboard event with all modifiers
    const event = new KeyboardEvent("keydown", {
      key: key,
      ...modifiers,
      bubbles: true,
      cancelable: true,
    });

    document.activeElement.dispatchEvent(event);
  });
}

function isCodeMirrorEditor(element) {
  return element.classList.contains("cm-content");
}

function simulateTypingInCodeMirrorEditor(text) {
  let typingPromiseResolve;
  const typingPromise = new Promise((resolve) => {
    typingPromiseResolve = resolve;
  });

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
    } else {
      // Resolve the promise when typing is done
      typingPromiseResolve();
    }
  }

  typeNextCharacter();

  return typingPromise;
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
