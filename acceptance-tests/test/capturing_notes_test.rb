require_relative '../test_helper'

class CapturingNotesTest < AcceptanceTest
  scenario 'Pressing the global shortcut lets you immediately start capturing a note' do
    user_presses_capture_note_shortcut

    expect_note_capture_window_to_show

    user_types 'Quick Note'

    expect_note_editor_content_to_be 'Quick Note'
  end

  scenario 'Capturing a note' do
    start_capture_note
    enter_note_text <<~NOTE
      # Lab Report 35
      Today we made a breakthrough!
    NOTE
    submit_note

    expect_captured_note title: 'Lab Report 35',
                         content: <<~NOTE
                           # Lab Report 35
                           Today we made a breakthrough!
                         NOTE
  end
end
