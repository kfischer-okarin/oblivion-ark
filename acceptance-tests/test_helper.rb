require 'minitest/autorun'
require 'minitest/reporters'

require_relative 'acceptance_test_dsl'
require_relative 'electron_app_socket_driver'

Minitest::Reporters.use! Minitest::Reporters::DefaultReporter.new

class AcceptanceTest < Minitest::Test
  include AcceptanceTestDSL

  def before_setup
    @driver = ElectronAppSocketDriver.new
  end

  def after_teardown
    @driver.teardown
  end
end
