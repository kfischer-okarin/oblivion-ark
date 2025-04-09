require 'pathname'
require 'tmpdir'
require 'socket'

require_relative 'sub_process'

class AppProcess < SubProcess
  def initialize
    app_executable_path = find_app_executable_path
    @socket_path = prepare_socket_path
    super(app_executable_path, ['--driver-socket', @socket_path], name: 'app')
    wait_until_file_exists @socket_path
    @socket = UNIXSocket.new(@socket_path)
  end

  private

  def find_app_executable_path
    frontend_path = Pathname.new(__dir__) / '..' / '..' / 'frontend'
    app_path = frontend_path.glob('out/**/*.app').first
    app_path.glob('Contents/MacOS/*').first.to_s
  end

  def prepare_socket_path
    temp_dir = Dir.mktmpdir('oblivion-ark-test')
    File.join(temp_dir, 'app.sock')
  end

  def wait_until_file_exists(file_path)
    until File.exist?(file_path)
      sleep 0.1
    end
  end
end


