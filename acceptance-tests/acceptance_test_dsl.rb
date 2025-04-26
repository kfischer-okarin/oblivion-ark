# frozen_string_literal: true

# AcceptanceTestDSL provides a high-level interface for end-to-end testing of the Oblivion Ark application.
# This module contains helper methods that abstract the lower-level interactions with the electron app driver,
# allowing tests to be written in a more readable and domain-focused way.
#
# It is included in the AcceptanceTest class, which is the base class for all acceptance tests.
module AcceptanceTestDSL
  NOTE_CAPTURE_WINDOW_PAGE = 'quick-capture-view.html'

  def user_presses_capture_note_shortcut
    @driver_client.trigger_global_shortcut(accelerator: 'Shift+F5')
  end

  def expect_note_capture_window_to_show
    @driver_client.wait_for_window_shown(
      params_matcher: ->(params) { params[:page] == NOTE_CAPTURE_WINDOW_PAGE }
    )
  end

  def user_types(text)
    @driver_client.enter_text(text:)
    @driver_client.wait_for_enter_text_done
  end

  def start_capture_note
    user_presses_capture_note_shortcut
    expect_note_capture_window_to_show
  end

  def enter_note_text(text)
    user_types text
  end

  def submit_note
    @driver_client.send_key(key: 'Cmd+Enter')
  end
end
