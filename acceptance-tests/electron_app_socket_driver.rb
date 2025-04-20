require_relative 'lib/app_process'

class ElectronAppSocketDriver
  class << self
    def app_process
      return @app_process if @app_process

      build_application
      @app_process = AppProcess.new

      at_exit do
        puts 'Shutting down Electron app...'
        @app_process.kill
        @app_process.wait_until_finished
        puts 'Electron app shut down.'
      end

      @app_process
    end

    private

    def build_application
      puts 'Building Electron app...'
      SubProcess.execute('just', ['build'], name: 'build', env: {'FORCE_COLOR' => '1'})
    end
  end

  def initialize
    @app_process = self.class.app_process
  end

  def start_capture_note
    @app_process.send_command_and_wait('quickCapture')
    @app_process.wait_for_notification('windowReady')
  end

  def enter_note_text(text)
    @app_process.send_command_and_wait('enterText', params: {text:})
    @app_process.wait_for_notification('enterTextDone')
  end

  def teardown
  end
end