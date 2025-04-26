require_relative '../test_helper'

class CapturingNotesTest < AcceptanceTest
  def test_capture_note
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
