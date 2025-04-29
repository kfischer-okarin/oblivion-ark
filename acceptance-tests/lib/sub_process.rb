require 'open3'

# This is a utility class for managing external processes and forwarding their
# output to the calling process's output streams.
#
# It adds color-coded prefixes to the output of the command being executed,
# allowing for easier identification of the source of the output.
#
# The class is used to run the processes involved in the acceptance tests,
# such as the Electron app and the build process.
class SubProcess
  ASCII_RED = 31
  ASCII_YELLOW = 33

  def self.execute(cmd, args = [], name:, env: {})
    process = new(cmd, args, name: name, env: env)
    process.wait_until_finished
  end

  def initialize(cmd, args = [], name:, env: {})
    _, stdout, stderr, @wait_thread = Open3.popen3(env, cmd, *args)

    forward_output(stdout, $stdout, prefix: colorize("[#{name} stdout] ", ASCII_YELLOW))
    forward_output(stderr, $stderr, prefix: colorize("[#{name} stderr] ", ASCII_RED))
  end

  def wait_until_finished
    @wait_thread.join
  end

  def kill
    Process.kill('TERM', @wait_thread.pid)
  end

  private

  def forward_output(input_io, output_io, prefix:)
    Thread.new do
      input_io.each_line do |line|
        output_io.puts "#{prefix}#{line}"
      end
    end
  end

  def colorize(text, color_code)
    "\e[#{color_code}m#{text}\e[0m"
  end
end