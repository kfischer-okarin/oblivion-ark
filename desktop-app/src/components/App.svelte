<script>
  import { onMount } from 'svelte';
  import NoteEditor from './NoteEditor.svelte';

  let editor;

  function submitNote(noteContent) {
    window.OblivionArk.submitNote(noteContent);
  }

  onMount(() => {
    window.OblivionArk.handleResetWindowWith(() => {
      if (editor) {
        editor.resetEditor();
      }
    });
  });
</script>

<main>
  <NoteEditor bind:this={editor} handleSubmit={submitNote} />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
</style>