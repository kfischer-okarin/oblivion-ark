require_relative 'lib/app'
require_relative 'lib/electron_app_driver_protocol_client'
require_relative 'lib/json_rpc_client'

class ElectronAppSocketDriver
  class << self
    def driver_client
      return @driver_client if @driver_client

      app = start_app
      @driver_client = ElectronAppDriverProtocolClient.new(
        JsonRpcClient.new(app.driver_socket)
      )
      @driver_client.wait_for_startup_finished
      @driver_client
    end

    private

    def start_app
      App.build
      app = App.start

      at_exit do
        puts 'Shutting down Electron app...'
        app.shutdown
        puts 'Electron app shut down.'
      end

      app
    end

  end

  def initialize
    @driver_client = self.class.driver_client
  end

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

  def teardown
    @driver_client.reset_application
  end
end