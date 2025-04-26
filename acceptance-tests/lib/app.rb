require 'pathname'
require 'tmpdir'
require 'socket'

require_relative 'sub_process'

class App
  attr_reader :driver_socket

  def initialize(process:, driver_socket:)
    @process = process
    @driver_socket = driver_socket
  end

  def shutdown
    @process.kill
    @process.wait_until_finished
  end

  class << self
    def start
      app_executable_path = find_app_executable_path
      socket_path = prepare_socket_path
      process = SubProcess.new(app_executable_path, ['--driver-socket', socket_path], name: 'app')
      wait_until_file_exists socket_path

      new(process:, driver_socket: UNIXSocket.new(socket_path))
    end

    private

    def find_app_executable_path
      project_root_path = Pathname.new(__dir__)
      project_root_path = project_root_path.parent until (project_root_path / '.git').exist?
      app_path = project_root_path / 'desktop-app'
      package_path = app_path.glob('out/**/*.app').first
      package_path.glob('Contents/MacOS/*').first.to_s
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
end


