# frozen_string_literal: true

# This module provides a DSL for describing the application's behaviour in an
# expressive format.
#
# The DSL is written from the user's perspective with action methods in the
# imperative and expectations starting with `expect_`.
#
# It is included in the AcceptanceTest class, which is the base class for all
# acceptance tests. It is kept separate from the base class to have the whole
# DSL in one place.
module AcceptanceTestDSL
  NOTE_CAPTURE_WINDOW_PAGE = 'note-capture-window.html'

  def press_capture_note_shortcut
    @driver_client.trigger_global_shortcut(accelerator: 'Shift+F5')
  end

  def expect_note_capture_window_to_show
    @driver_client.wait_for_window_shown(
      params_matcher: ->(params) { params[:page] == NOTE_CAPTURE_WINDOW_PAGE }
    )
  end

  def type_text(text)
    @driver_client.enter_text(text:)
  end

  def expect_note_editor_content_to_be(expected_content)
    content_response = @driver_client.get_text_field_content(id: 'editor')
    assert_equal expected_content, content_response[:result]
  end

  def open_note_capture_window
    press_capture_note_shortcut
    expect_note_capture_window_to_show
  end

  def press_key(key)
    @driver_client.send_key(key:)
  end
end
