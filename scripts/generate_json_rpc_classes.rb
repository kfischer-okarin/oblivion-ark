#!/usr/bin/env ruby

require 'json'
require 'pathname'

class RpcClientGenerator
  def initialize(openrpc_spec_path)
    @openrpc_spec_path = openrpc_spec_path
    @spec = JSON.parse(File.read(@openrpc_spec_path), symbolize_names: true)
  end

  def code
    result_parts = []

    methods = @spec[:methods].select { |m| m.key? :result }
    notifications = @spec[:methods].select { |m| !m.key? :result }

    result_parts << <<~RUBY
      # This file is auto-generated. Do not edit it manually.
      # Generated from OpenRPC spec at #{relative_spec_path}
      # frozen_string_literal: true

      class #{class_name}
        def initialize(json_rpc_client)
          @json_rpc_client = json_rpc_client
        end
    RUBY

    methods.each do |method|
      method_name = StringHelpers.snake_case(method[:name])
      params = method[:params]&.map { |p| StringHelpers.snake_case(p[:name]) } || []

      method_args = params.map { |p| "#{p}:" }.join(', ')
      params_hash_content = params.map { |p| "#{p}:" }.join(', ')

      result_parts << "\n"
      result_parts << StringHelpers.indent_string(<<~RUBY, 2)
        def #{method_name}(#{method_args})
          @json_rpc_client.send_command_and_wait("#{method[:name]}", params: {#{params_hash_content}})
        end
      RUBY
    end

    notifications.each do |notification|
      notification_name = StringHelpers.snake_case(notification[:name])

      result_parts << "\n"
      result_parts << StringHelpers.indent_string(<<~RUBY, 2)
        def wait_for_#{notification_name}(timeout: 5)
          @json_rpc_client.wait_for_notification("#{notification[:name]}", timeout:)
        end
      RUBY
    end

    result_parts << "end\n"
    result_parts.join
  end

  def filename
    "#{StringHelpers.snake_case(class_name)}.rb"
  end

  private

  def class_name
    StringHelpers.words_to_pascal_case(@spec[:info][:title]) + 'Client'
  end

  def relative_spec_path
    @openrpc_spec_path.relative_path_from(Pathname.new(__dir__).join('..'))
  end
end

class RpcServerGenerator
  def initialize(openrpc_spec_path)
    @openrpc_spec_path = openrpc_spec_path
    @spec = JSON.parse(File.read(@openrpc_spec_path), symbolize_names: true)
  end

  def code
    result_parts = []

    methods = @spec[:methods].select { |m| m.key? :result }
    notifications = @spec[:methods].select { |m| !m.key? :result }

    driver_name = StringHelpers.words_to_pascal_case(@spec[:info][:title])

    # Start with JS header and function definition
    result_parts << <<~CODE
      // This file is auto-generated. Do not edit it manually.
      // Generated from OpenRPC spec at #{relative_spec_path}

      /**
       * Builds an RPC server with methods and notification functions
       * @param {JSONRPCServerAndClient} server - JSON-RPC server and client
       * @param {Object} handlers - Handler implementations for RPC methods
       * @returns {Object} Object with notification methods
       */
      export function build#{driver_name}Server(server, handlers) {
    CODE

    # Add method handlers
    methods.each do |method|
      method_name = method[:name]
      handler_name = "handle#{StringHelpers.camel_case_to_pascal_case(method_name)}"

      result_parts << StringHelpers.indent_string(<<~CODE, 2)
        if (typeof handlers.#{handler_name} !== "function") {
          throw new Error("Missing handler: #{handler_name}");
        }
        server.addMethod("#{method_name}", handlers.#{handler_name});
      CODE
    end

    # Create result object with notification methods
    result_parts << "\n"
    result_parts << StringHelpers.indent_string(<<~CODE, 2)
      return {
    CODE

    # Add notification methods
    notifications.each do |notification|
      notification_name = notification[:name]
      notify_method_name = "notify#{StringHelpers.camel_case_to_pascal_case(notification_name)}"

      # Get params, default to empty array
      params = notification[:params] || []

      # If there are no params, we still need to handle that case
      if params.empty?
        result_parts << StringHelpers.indent_string(<<~CODE, 4)
          #{notify_method_name}() {
            server.notify("#{notification_name}");
          },
        CODE
      else
        # For params, we create a JS object with all the params
        param_names = params.map { |p| p[:name] }
        params_arg_list = param_names.join(", ")
        params_obj = "{ #{param_names.join(", ")} }"

        result_parts << StringHelpers.indent_string(<<~CODE, 4)
          #{notify_method_name}(#{params_arg_list}) {
            server.notify("#{notification_name}", #{params_obj});
          },
        CODE
      end
    end

    # Close the notifications object and function
    result_parts << <<~CODE
        };
      }
    CODE

    result_parts.join
  end

  def filename
    base_name = StringHelpers.words_to_pascal_case(@spec[:info][:title])
    "#{StringHelpers.pascal_case_to_camel_case(base_name)}Server.js"
  end

  private

  def relative_spec_path
    @openrpc_spec_path.relative_path_from(Pathname.new(__dir__).join('..'))
  end
end

module StringHelpers
  module_function

  def snake_case(str)
    str.gsub(/([A-Z])/, '_\\1').downcase.sub(/^_/, '')
  end

  def words_to_pascal_case(str)
    str.split(/\s+/).map(&:capitalize).join
  end

  def pascal_case_to_camel_case(str)
    str[0].downcase + str[1..-1]
  end

  def camel_case_to_pascal_case(str)
    str[0].upcase + str[1..-1]
  end

  def indent_string(string, spaces)
    string.split("\n").map { |line| ' ' * spaces + line + "\n" }.join
  end
end

if __FILE__ == $PROGRAM_NAME
  spec_path = Pathname.new(__dir__) / '..' / 'frontend' / 'driver.openrpc.json'

  # Generate client code
  client_generator = RpcClientGenerator.new(spec_path)
  client_code = client_generator.code
  client_output_path = Pathname.new(__dir__) / '..' / 'acceptance-tests' / 'lib' / client_generator.filename
  File.write(client_output_path, client_code)
  puts "Generated RPC client code at #{client_output_path}"

  # Generate server code
  server_generator = RpcServerGenerator.new(spec_path)
  server_code = server_generator.code
  server_output_path = Pathname.new(__dir__) / '..' / 'frontend' / 'app' / server_generator.filename
  File.write(server_output_path, server_code)
  system "just fix #{server_output_path}"
  puts "Generated RPC server code at #{server_output_path}"
end
