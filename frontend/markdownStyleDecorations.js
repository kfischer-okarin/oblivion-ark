import { ViewPlugin, Decoration } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';

/**
 * Plugin that adds WYSIWYG-like styling to markdown elements
 */
const markdownStyleDecorations = ViewPlugin.define(view => {
  const highlightStyle = oneDarkHighlightStyle;
  const urlColor = urlColorFrom(highlightStyle);

  // Set the CSS variable on the editor element
  if (urlColor) {
    view.dom.style.setProperty('--url-color', urlColor);
  }

  const buildUrlMark = (url) => Decoration.mark({
    attributes: {
      'data-url': url,
      class: 'cm-url-link'
    }
  });

  const plugin = {
    decorations: Decoration.none,
  }

  // Store link data to use when handling clicks
  let linkRanges = []

  // Track command key state
  let isCommandKeyPressed = false

  // Track current hover position
  let currentHoverPos = null

  function handleClick(event, view) {
    // Only process clicks when Command key is pressed
    if (!event.metaKey) {
      return false;
    }

    // Find decoration elements that were clicked
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });

    const matchingRange = linkRanges.find(range => pos >= range.from && pos <= range.to);

    if (!matchingRange) {
      return false;
    }

    const { url } = matchingRange;
    window.open(url, '_blank');
    event.preventDefault();
    return true;
  }

  function handleMouseMove(event, view) {
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    currentHoverPos = pos;
    updateCursorStyle(view);
  }

  function handleMouseLeave() {
    currentHoverPos = null;
    updateCursorStyle();
  }

  function handleKeyDown(event) {
    if (event.key === 'Meta') {
      isCommandKeyPressed = true;
      updateCursorStyle();
    }
  }

  function handleKeyUp(event) {
    if (event.key === 'Meta') {
      isCommandKeyPressed = false;
      updateCursorStyle();
    }
  }

  function updateCursorStyle() {
    const editor = document.querySelector('.cm-editor');
    if (!editor) return;

    if (isCommandKeyPressed && currentHoverPos !== null) {
      const isOverLink = linkRanges.some(range =>
        currentHoverPos >= range.from && currentHoverPos <= range.to
      );

      editor.style.cursor = isOverLink ? 'pointer' : '';
    } else {
      editor.style.cursor = '';
    }
  }

  function update(view) {
    linkRanges = [];

    const decorationsArray = [];
    const tree = syntaxTree(view.state);

    tree.cursor().iterate(node => {
      if (node.name.startsWith("ATXHeading")) {
        const level = parseInt(node.name.substring(10)) || 1;
        if (level >= 1 && level <= 6) {
          const deco = Decoration.line({
            class: `cm-heading cm-heading${level}`
          });
          const line = view.state.doc.lineAt(node.from);
          decorationsArray.push(deco.range(line.from));
        }
      } else if (node.name === "Emphasis") { // *italic* or _italic_
        const deco = Decoration.mark({
          class: "cm-emphasis"
        });
        decorationsArray.push(deco.range(node.from, node.to));
      } else if (node.name === "StrongEmphasis") { // **bold** or __bold__
        const deco = Decoration.mark({
          class: "cm-strong"
        });
        decorationsArray.push(deco.range(node.from, node.to));
      } else if (node.name === "Strikethrough") { // ~~strikethrough~~
        const deco = Decoration.mark({
          class: "cm-strikethrough"
        });
        decorationsArray.push(deco.range(node.from, node.to));
      } else if (node.name === "Link") {
        const { textRange, url } = parseLinkNode(node.node, view);
        if (!url) {
          return;
        }

        const deco = buildUrlMark(url);
        decorationsArray.push(deco.range(textRange.from, textRange.to));
        linkRanges.push({ from: textRange.from, to: textRange.to, url });
      } else if (node.name === "URL") {
        // Skip if the node is already a link since we want to stress the link text and not the URL
        if (node.matchContext(["Link"])) {
          return;
        }

        const url = view.state.doc.sliceString(node.from, node.to);
        const deco = buildUrlMark(url);
        decorationsArray.push(deco.range(node.from, node.to));
        linkRanges.push({ from: node.from, to: node.to, url });
      }
    });

    plugin.decorations = Decoration.set(decorationsArray);
  }

  plugin.update = update;
  plugin.mousedown = handleClick;
  plugin.mousemove = handleMouseMove;
  plugin.mouseleave = handleMouseLeave;

  // Add global event listeners for command key detection
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Clean up event listeners when plugin is destroyed
  plugin.destroy = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };

  update(view);

  return plugin;
}, {
  decorations: v => v.decorations,
  eventHandlers: {
    mousedown: (e, view) => {
      return view.plugin(markdownStyleDecorations)?.mousedown(e, view) || false;
    },
    mousemove: (e, view) => {
      view.plugin(markdownStyleDecorations)?.mousemove(e, view);
      return false;
    },
    mouseleave: (e, view) => {
      view.plugin(markdownStyleDecorations)?.mouseleave(e, view);
      return false;
    }
  }
});

function parseLinkNode(node, view) {
  const [
    squareBracketLeft,
    squareBracketRight,
    bracketLeft,
    bracketRight
  ] = node.getChildren('LinkMark');

  const textRange = { from: squareBracketLeft.to, to: squareBracketRight.from };
  const text = view.state.doc.sliceString(textRange.from, textRange.to);

  if (!bracketLeft || !bracketRight) {
    return { text, textRange };
  }

  const urlRange = { from: bracketLeft.to, to: bracketRight.from };
  const url = view.state.doc.sliceString(urlRange.from, urlRange.to);
  return { text, url, textRange, urlRange };
}

const urlColorFrom = (highlightStyle) => {
  const urlSpecs = specsApplyingToTag(highlightStyle, 'url');
  if (urlSpecs.length === 0) {
    return null;
  }
  const urlSpec = urlSpecs[0];
  return urlSpec.color;
}

const specsApplyingToTag = (highlightStyle, tagName) => {
  const specs = highlightStyle.specs;
  return specs.filter(spec => {
    if (Array.isArray(spec.tag)) {
      return spec.tag.some(t => t.name === tagName);
    }
    return spec.tag.name === tagName;
  });
};

export default markdownStyleDecorations;
