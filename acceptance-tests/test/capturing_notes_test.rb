require_relative '../test_helper'

class CapturingNotesTest < AcceptanceTest
  scenario 'Pressing the global shortcut lets you immediately start capturing a note' do
    press_capture_note_shortcut

    expect_note_capture_window_to_show

    type_text 'Quick Note'

    expect_note_editor_content_to_be 'Quick Note'
  end

  scenario 'Pressing Cmd+Enter submits the note' do
    open_note_capture_window
    type_text <<~NOTE
      # Lab Report 35
      Today we made a breakthrough!
    NOTE

    press_key 'Cmd+Enter'

    expect_success_notification 'Note saved'
  end
end
