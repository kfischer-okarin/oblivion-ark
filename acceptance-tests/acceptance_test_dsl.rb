module AcceptanceTestDSL
  def method_missing(name, *args, &block)
    skip "DSL method `#{name}` not yet implemented"
  end
end
