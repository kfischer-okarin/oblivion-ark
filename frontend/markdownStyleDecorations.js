import { ViewPlugin, Decoration } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';

/**
 * Plugin that adds WYSIWYG-like styling to markdown elements
 */
const markdownStyleDecorations = ViewPlugin.define(view => {
  const highlightStyle = oneDarkHighlightStyle;
  const urlColor = urlColorFrom(highlightStyle);
  const buildUrlMark = (url) => Decoration.mark({
    attributes: {
      style: `text-decoration: underline; color: ${urlColor}; cursor: pointer;`,
    }
  });

  const plugin = {
    decorations: Decoration.none,
  }

  function update(view) {
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
      } else if (node.name === "URL") {
        // Skip if the node is already a link since we want to stress the link text and not the URL
        if (node.matchContext(["Link"])) {
          return;
        }

        const url = view.state.doc.sliceString(node.from, node.to);
        const deco = buildUrlMark(url);
        decorationsArray.push(deco.range(node.from, node.to));
      }
    });

    plugin.decorations = Decoration.set(decorationsArray);
  }

  plugin.update = update;
  update(view);

  return plugin;
}, {
  decorations: v => v.decorations
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
