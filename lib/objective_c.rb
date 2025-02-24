require_relative 'objective_c/object'

module ObjectiveC
  class << self
    attr_writer :ffi

    def ffi
      @ffi ||= FFI
    end

    def const_missing(name)
      klass = ffi.objc_getClass(name.to_s)
      const_set(name, Object.new(klass))
    end
  end
end
