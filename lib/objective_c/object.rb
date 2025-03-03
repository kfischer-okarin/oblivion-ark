require 'ffi'

module ObjectiveC
  class Object < ::FFI::Pointer
    def objc_class
      @objc_class ||= ObjectiveC.ffi.object_getClass(self)
    end
  end
end
