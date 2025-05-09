require 'json'
require 'securerandom'
require 'thread'

# A client implementation of JSON-RPC 2.0 protocol for bidirectional
# communication via an IO stream object.
#
# This class provides functionality to:
# - Send JSON-RPC commands and wait for the corresponding response
# - Wait for a specific type of notification from the server
#
# It serves as the low-level communication layer for the automated testing
# framework, supporting higher-level protocol clients like
# ElectronAppDriverProtocolClient.
class JsonRpcClient
  def initialize(io)
    @io = io
    @received_message_queue = Queue.new
    @pending_requests = {}
    @mutex = Thread::Mutex.new

    # Start a thread to read responses
    start_response_reader
  end

  def send_command(method, params: {})
    request_id = SecureRandom.uuid
    message = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: request_id
    }

    # Register this request as pending
    @mutex.synchronize do
      @pending_requests[request_id] = nil
    end

    json_message = JSON.generate(message)
    @io.puts(json_message)
    @io.flush

    request_id
  end

  def send_command_and_wait(method, params: {}, timeout: 5)
    request_id = send_command(method, params: params)
    wait_for_response(request_id, timeout: timeout)
  end

  def wait_for_response(request_id, timeout: 5)
    raise "No pending request with ID #{request_id}" unless @pending_requests.key?(request_id)

    response = nil

    wait_for("response to request #{request_id}", timeout: timeout) do
      @mutex.synchronize do
        response = @pending_requests[request_id]
        puts "Received response: #{response.inspect}" if response
        @pending_requests.delete(request_id) if response # delete will return the response
      end
    end

    response
  end

  MATCH_ANY = ->(value) { true }

  def wait_for_notification(notification_type, params_matcher: nil, timeout: 5)
    params_matcher ||= MATCH_ANY

    notification = nil

    wait_for("notification of type #{notification_type}", timeout: timeout) do
      @mutex.synchronize do
        unless @received_message_queue.empty?
          notification = @received_message_queue.pop
          puts "Received notification: #{notification.inspect}"
          return false unless params_matcher.call(notification[:params])
          return notification if notification[:method] == notification_type
        end
        false
      end
    end

    notification
  end

  private

  def start_response_reader
    @reader_thread = Thread.new do
      begin
        while line = @io.gets
          begin
            response = JSON.parse(line, symbolize_names: true)

            if response[:id] && @pending_requests.key?(response[:id])
              @mutex.synchronize do
                @pending_requests[response[:id]] = response
              end
            else
              # Handle notifications (messages without an id or unexpected responses)
              @mutex.synchronize do
                @received_message_queue.push(response)
              end
            end
          rescue JSON::ParserError => e
            $stderr.puts "Failed to parse JSON response: #{e.message}"
          end
        end
      rescue IOError, Errno::EBADF => e
        # IO was closed
        $stderr.puts "IO reader thread terminated: #{e.message}"
      rescue StandardError => e
        $stderr.puts "Error in IO reader thread: #{e.message}\n#{e.backtrace.join("\n")}"
      end
    end
  end

  def wait_for(description, timeout:, &block)
    start_time = Time.now
    loop do
      begin
        return if yield
      rescue StandardError => e
        $stderr.puts "Error while waiting for #{description}: #{e.message}"
      end

      raise "Timeout waiting for #{description}" if Time.now - start_time > timeout

      sleep 0.01
    end
  end
end