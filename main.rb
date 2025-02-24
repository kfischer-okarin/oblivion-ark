require 'bundler/setup'

require 'ffi'

module ObjC
  # Basic low-level FFI bindings for Objective-C
  module FFI
    extend ::FFI::Library
    # Headers in /Library/Developer/CommandLineTools/SDKs/MacOSX15.2.sdk/usr/include
    ffi_lib '/usr/lib/libobjc.dylib'

    typedef :pointer, :id
    typedef :pointer, :Class
    typedef :pointer, :SEL
    typedef :pointer, :Method

    attach_function :class_getInstanceMethod, [:Class, :SEL], :Method
    attach_function :class_respondsToSelector, [:Class, :SEL], :bool
    attach_function :method_getArgumentType, [:Method, :uint, :pointer, :size_t], :void
    attach_function :method_getNumberOfArguments, [:Method], :uint
    attach_function :method_getReturnType, [:Method, :pointer, :size_t], :void
    attach_function :objc_getClass, [:string], :Class
    attach_function :objc_msgSend, [:id, :SEL, :varargs], :id
    attach_function :object_getClass, [:id], :id
    attach_function :sel_getUid, [:string], :SEL
  end

  class Object < ::FFI::Pointer
    def method_missing(method_name, *arguments, **kwargs)
      selector_candidate_names = [method_name.to_s, "#{method_name}:"]
      if kwargs.any?
        # Method name with keyword arguments
        selector_candidate_names << ["#{method_name}:", kwargs.keys.map { |key| "#{key}:" }].join
      end
      selector_name = nil
      selector = nil
      selector_candidate_names.each do |name|
        candidate = FFI.sel_getUid(name)
        next unless FFI.class_respondsToSelector(objc_class, candidate)

        selector = candidate
        selector_name = name
        break
      end
      raise NoMethodError, "undefined method `#{method_name}' for #{self.inspect}" unless selector

      define_singleton_method(method_name) do |*args|
        return_type_signature, argument_signatures = signature_for_selector(selector)
        msgSend_arguments = argument_signatures.zip(arguments).flatten
        puts "#{self.inspect} -> #{selector_name}(#{argument_signatures}) #{return_type_signature} -> #{msgSend_arguments}"
        result = FFI.objc_msgSend(self, selector, *msgSend_arguments)
        result && result.null? ? nil : coerce_return_value(result, return_type_signature)
      end

      send(method_name, *arguments)
    end

    def inspect
      # Implement directly to avoid infinite recursion
      return_value = FFI.objc_msgSend(
        FFI.objc_msgSend(self, FFI.sel_getUid('description')),
        FFI.sel_getUid('UTF8String')
      )
      return_value.read_string
    end

    def objc_class
      @objc_class ||= Object.new(FFI.object_getClass(self))
    end

    private

    def signature_for_selector(selector)
      type_buffer = ::FFI::MemoryPointer.new(:char, 32)
      method = FFI.class_getInstanceMethod(objc_class, selector)
      FFI.method_getReturnType(method, type_buffer, type_buffer.size)
      return_type = type_buffer.read_string
      # the first 2 arguments are always the receiver and the selector - don't care about those
      arguments =  (2...FFI.method_getNumberOfArguments(method)).map { |index|
        FFI.method_getArgumentType(method, index, type_buffer, type_buffer.size)
        objc_signature_to_ffi_type(type_buffer.read_string)
      }

      [return_type, arguments]
    end

    def objc_signature_to_ffi_type(signature)
      case signature
      when '@','#',':' then :pointer
      when '*', 'r*' then :string
      when 'c'  then :char
      when 'C'  then :uchar
      when 's'  then :short
      when 'S'  then :ushort
      when 'i'  then :int
      when 'I'  then :uint
      when 'l'  then :long
      when 'L'  then :ulong
      when 'q'  then :long_long
      when 'Q'  then :ulong_long
      when 'f'  then :float
      when 'd'  then :double
      else
        raise "unhandled argument type #{signature}"
      end
    end

    def coerce_return_value pointer, return_type
      case return_type
      when '@' then Object.new(pointer)
      when 'v' then nil
      when '*', 'r*' then pointer.read_string
      when 'c', 'C', 's', 'S', 'i', 'I', 'l', 'L', 'q', 'Q'
        repack(pointer.address, return_type)
      else
        pointer
      end
    end

    def repack(raw, format)
      [raw].pack('Q').unpack(format).first
    end
  end

  class << self
    def import_library(name)
      FFI.ffi_lib name
    end

    def const_missing(name)
      objc_class = FFI.objc_getClass(name.to_s)
      if objc_class.null?
        super
      else
        const_set(name, Object.new(objc_class))
      end
    end
  end
end

class CGPoint < FFI::Struct
  layout :x, :double,
         :y, :double
end

class CGSize < FFI::Struct
  layout :width, :double,
         :height, :double
end

class CGRect < FFI::Struct
  layout :origin, CGPoint,
         :size, CGSize
end

module ObjC
  import_library '/System/Library/Frameworks/AppKit.framework/AppKit'

  module FFI
    attach_function :CFStringCreateWithCString, [:pointer, :string, :int], :pointer
    attach_function :CFRelease, [:pointer], :void
  end

  class CFReference < ::FFI::AutoPointer
    def self.release(pointer)
      FFI.CFRelease(pointer)
    end
  end

  class << self
    def string(string)
      CFReference.new FFI.CFStringCreateWithCString(nil, string, 0)
    end
  end
end

ObjC::FFI.attach_function :objc_msgSend_id, :objc_msgSend, [:id, :SEL, :id], :id
ObjC::FFI.attach_function :objc_msgSend_window, :objc_msgSend, [:id, :SEL, CGRect.by_value, :uint, :uint, :bool], :id

def run
  window = ObjC::NSWindow.alloc
  rect = CGRect.new
  rect[:origin][:x] = 0
  rect[:origin][:y] = 0
  rect[:size][:width] = 200
  rect[:size][:height] = 200
  selector = ObjC::FFI.sel_getUid('initWithContentRect:styleMask:backing:defer:')
  p ObjC::FFI.objc_msgSend_window(window, selector, rect, 15, 2, false)
  ObjC::FFI.objc_msgSend_id(window, ObjC::FFI.sel_getUid('setTitle:'), ObjC.string('Hello, World!'))
  # window.setTitle(ObjC.string('Hello, World!'))
  window.makeKeyAndOrderFront(nil)
  ObjC::NSApplication.sharedApplication.run
  # window.run
  # window.cobj_send('initWithContentRect:styleMask:backing:defer:', CGRect.by_value, rect, :uint, 15, :uint, 2, :bool, false)
  # window.initWithContentRect([0, 0, 200, 200], styleMask: 15, backing: 2, defer: false)
end

run
