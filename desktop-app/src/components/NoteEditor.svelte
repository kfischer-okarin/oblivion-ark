<script>
  import { onMount } from 'svelte';
  import { keymap, EditorView, placeholder } from '@codemirror/view';
  import { standardKeymap, history } from '@codemirror/commands';
  import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
  import { oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';

  import markdownStyleDecorations from '@/codemirror-extensions/markdownStyleDecorations.js';

  export let handleSubmit;
  let editorElement;
  let view;

  onMount(() => {
    // Create editor view
    view = new EditorView({
      doc: '',
      parent: editorElement,
      extensions: [
        keymap.of([
          ...standardKeymap,
          {
            key: 'Mod-Enter',
            run: () => {
              const noteContent = view.state.doc.toString();
              handleSubmit(noteContent);
              return true;
            },
          },
        ]),
        history(),
        oneDarkTheme,
        placeholder('Type your notes here...'),
        markdown({
          base: markdownLanguage,
        }),
        markdownStyleDecorations({
          highlightStyle: oneDarkHighlightStyle,
        }),
      ],
    });

    // Focus the editor immediately
    view.focus();

    return () => {
      if (view) {
        view.destroy();
      }
    };
  });

  export function resetEditor() {
    if (view) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: '' },
      });
    }
  }
</script>

<div bind:this={editorElement} class="editor"></div>

<style>
  .editor {
    height: 100%;
  }

  :global(.cm-editor) {
    height: 100%;
  }

  :global(.cm-editor .cm-content) {
    font-size: 16px;
    padding: 10px;
  }
</style>