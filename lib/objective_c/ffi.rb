require 'ffi'

module ObjectiveC
  class FFI
    extend ::FFI::Library

    # Headers in /Library/Developer/CommandLineTools/SDKs/MacOSX15.2.sdk/usr/include
    ffi_lib '/usr/lib/libobjc.dylib'

    typedef :pointer, :id
    typedef :pointer, :Class

    attach_function :objc_getClass, [:string], :Class
  end
end