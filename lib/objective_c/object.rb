require 'bundler/setup'

require 'ffi'

module ObjectiveC
  class Object < ::FFI::Pointer
    def objc_class
      @objc_class ||= ObjectiveC.ffi.object_getClass(self)
    end

    def method_missing(name, *args)
      selector = ObjectiveC.ffi.sel_getUid(name.to_s)
    end
  end
end
