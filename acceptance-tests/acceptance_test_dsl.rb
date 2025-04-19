module AcceptanceTestDSL
  def start_capture_note
    @driver.start_capture_note
  end

  def enter_note_text(text)
    @driver.enter_note_text(text)
  end

  def method_missing(name, *args, &block)
    skip "DSL method `#{name}` not yet implemented"
  end
end
