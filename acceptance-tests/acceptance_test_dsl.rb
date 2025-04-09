module AcceptanceTestDSL
  def start_capture_note
    @driver.start_capture_note
  end

  def method_missing(name, *args, &block)
    skip "DSL method `#{name}` not yet implemented"
  end
end
