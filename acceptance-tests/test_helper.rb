require 'minitest/autorun'
require 'minitest/reporters'

require_relative 'acceptance_test_dsl'

Minitest::Reporters.use! Minitest::Reporters::DefaultReporter.new

class AcceptanceTest < Minitest::Test
  include AcceptanceTestDSL
end
