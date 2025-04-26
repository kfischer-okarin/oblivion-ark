# AcceptanceTestDSL provides a high-level interface for end-to-end testing of the Oblivion Ark application.
# This module contains helper methods that abstract the lower-level interactions with the electron app driver,
# allowing tests to be written in a more readable and domain-focused way.
#
# It is included in the AcceptanceTest class, which is the base class for all acceptance tests.
module AcceptanceTestDSL
  def start_capture_note
    @driver_client.trigger_global_shortcut(accelerator: 'Shift+F5')
    @driver_client.wait_for_window_shown # TODO: Match page
  end

  def enter_note_text(text)
    @driver_client.enter_text(text:)
    @driver_client.wait_for_enter_text_done
  end

  def submit_note
    @driver_client.send_key(key: 'Cmd+Enter')
  end
end
