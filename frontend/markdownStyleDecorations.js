import { ViewPlugin, Decoration } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

/**
 * Plugin that adds WYSIWYG-like styling to markdown elements
 */
const markdownStyleDecorations = ViewPlugin.define(view => {
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

export default markdownStyleDecorations;