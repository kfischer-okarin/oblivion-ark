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
