# This file is auto-generated. Do not edit it manually.
# Generated from OpenRPC spec at desktop-app/driver.openrpc.json
# frozen_string_literal: true

# This class is a client implementation of the OpenRPC spec at
# desktop-app/driver.openrpc.json.
#
# It provides methods for each method defined in the spec as well as waiter
# methods for each notification type.
#
# It wraps a low-level JsonRpcClient instance and is used by the acceptance
# test DSL to communicate with the Electron application.
class ElectronAppDriverProtocolClient
  def initialize(json_rpc_client)
    @json_rpc_client = json_rpc_client
  end

  def trigger_global_shortcut(accelerator:)
    @json_rpc_client.send_command_and_wait("triggerGlobalShortcut", params: {accelerator:})
  end

  def enter_text(text:)
    @json_rpc_client.send_command_and_wait("enterText", params: {text:})
  end

  def send_key(key:)
    @json_rpc_client.send_command_and_wait("sendKey", params: {key:})
  end

  def reset_application
    @json_rpc_client.send_command_and_wait("resetApplication", params: {})
  end

  def get_text_field_content(id:)
    @json_rpc_client.send_command_and_wait("getTextFieldContent", params: {id:})
  end

  def wait_for_startup_finished(params_matcher: nil, timeout: 5)
    @json_rpc_client.wait_for_notification("startupFinished", params_matcher:, timeout:)
  end

  def wait_for_window_shown(params_matcher: nil, timeout: 5)
    @json_rpc_client.wait_for_notification("windowShown", params_matcher:, timeout:)
  end
end
