import { ViewPlugin, Decoration } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

/**
 * Plugin that adds WYSIWYG-like styling to markdown elements
 */
const markdownStyleDecorations = ViewPlugin.define(view => {
  let decorations = Decoration.none;

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
      }
    });

    decorations = Decoration.set(decorationsArray);
  }

  update(view);

  return {
    update,
    get decorations() { return decorations; }
  };
}, {
  decorations: v => v.decorations
});

export default markdownStyleDecorations;