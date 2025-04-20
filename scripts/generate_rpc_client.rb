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
      method_name = snake_case(method[:name])
      params = method[:params]&.map { |p| snake_case(p[:name]) } || []

      method_args = params.map { |p| "#{p}:" }.join(', ')
      params_hash_content = params.map { |p| "#{p}:" }.join(', ')

      result_parts << "\n"
      result_parts << indent_string(<<~RUBY, 2)
        def #{method_name}(#{method_args})
          @json_rpc_client.send_command_and_wait("#{method[:name]}", params: {#{params_hash_content}})
        end
      RUBY
    end

    notifications.each do |notification|
      notification_name = snake_case(notification[:name])

      result_parts << "\n"
      result_parts << indent_string(<<~RUBY, 2)
        def wait_for_#{notification_name}(timeout: 5)
          @json_rpc_client.wait_for_notification("#{notification[:name]}", timeout:)
        end
      RUBY
    end

    result_parts << "end\n"
    result_parts.join
  end

  def class_name
    camel_case(@spec[:info][:title]) + 'Client'
  end

  def filename
    "#{snake_case(class_name)}.rb"
  end

  def relative_spec_path
    @openrpc_spec_path.relative_path_from(Pathname.new(__dir__).join('..'))
  end

  private

  def camel_case(str)
    str.split(/\s+/).map(&:capitalize).join
  end

  def snake_case(str)
    str.gsub(/([A-Z])/, '_\\1').downcase.sub(/^_/, '')
  end

  def indent_string(string, spaces)
    string.split("\n").map { |line| ' ' * spaces + line + "\n" }.join
  end
end

if __FILE__ == $PROGRAM_NAME
  spec_path = Pathname.new(__dir__) / '..' / 'frontend' / 'driver.openrpc.json'
  generator = RpcClientGenerator.new(spec_path)
  code = generator.code

  output_path = Pathname.new(__dir__) / '..' / 'acceptance-tests' / 'lib' / generator.filename
  File.write(output_path, code)
  puts "Generated RPC client code at #{output_path}"
end
