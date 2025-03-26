import { ViewPlugin, Decoration, EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

/**
 * Define the styling for markdown elements dynamically
 */
const markdownTheme = EditorView.theme({
  '.cm-heading': { fontWeight: 'bold' },
  '.cm-heading1': { fontSize: '2em' },
  '.cm-heading2': { fontSize: '1.75em' },
  '.cm-heading3': { fontSize: '1.5em' },
  '.cm-heading4': { fontSize: '1.25em' },
  '.cm-heading5': { fontSize: '1.1em' },
  '.cm-heading6': { fontSize: '1em' },
  '.cm-emphasis': { fontStyle: 'italic' },
  '.cm-strong': { fontWeight: 'bold' },
  '.cm-strikethrough': { textDecoration: 'line-through' },
  '.cm-url-link': {
    textDecoration: 'underline',
    color: 'var(--url-color)'
  },
  '&.cm-links-clickable .cm-url-link': {
    cursor: 'pointer'
  }
});

/**
 * Plugin that adds WYSIWYG-like styling to markdown elements
 */
const markdownStyleDecorations = ({ highlightStyle }) => {
  // Store link data to use when handling clicks
  let linkRanges = []

  // Track command key state
  let isCommandKeyPressed = false

  function mousedown(event, view) {
    // Only process clicks when Command key is pressed
    if (!isCommandKeyPressed) {
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

  return ViewPlugin.define(view => {
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

    function handleKeyDown(event) {
      if (event.key === 'Meta') {
        isCommandKeyPressed = true;
        updateLinkInteractivity();
      }
    }

    function handleKeyUp(event) {
      if (event.key === 'Meta') {
        isCommandKeyPressed = false;
        updateLinkInteractivity();
      }
    }

    function updateLinkInteractivity() {
      if (isCommandKeyPressed) {
        view.dom.classList.add('cm-links-clickable');
      } else {
        view.dom.classList.remove('cm-links-clickable');
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
      mousedown,
    },
    provide: () => markdownTheme,
  });
}

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
