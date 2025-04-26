require 'minitest/autorun'
require 'minitest/reporters'

require_relative 'acceptance_test_dsl'
require_relative 'lib/app'

Minitest::Reporters.use! Minitest::Reporters::DefaultReporter.new

class AcceptanceTest < Minitest::Test
  include AcceptanceTestDSL

  class << self
    def app
      return @app if @app

      App.build
      @app = App.start

      at_exit do
        puts 'Shutting down Electron app...'
        @app.shutdown
        puts 'Electron app shut down.'
      end

      @app
    end

    def scenario(name, &block)
      define_method("test_#{name}", &block)
    end
  end

  def before_setup
    @driver_client = self.class.app.driver_client
  end

  def after_teardown
    @driver_client.reset_application
  end
end
