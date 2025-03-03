require 'minitest/autorun'

require_relative 'test_helpers'
require_relative '../lib/objective_c'

describe ObjectiveC do
  include ResetObjectiveCConstants
  include WithFFIMock
  include Factories

  let(:null_pointer) { FFI::Pointer.new(0) }

  it 'can dynamically reference classes' do
    ns_string_pointer = build_a_pointer
    ffi.expect :objc_getClass, ns_string_pointer, ['NSString']

    klass = ObjectiveC::NSString

    assert_equal ns_string_pointer, klass
  end

  it 'only loads classes once' do
    ffi.expect :objc_getClass, build_a_pointer, ['NSString']

    first_time = ObjectiveC::NSString
    second_time = ObjectiveC::NSString

    assert_equal second_time, first_time
  end

  it 'raises NameError when a class does not exist' do
    ffi.expect :objc_getClass, null_pointer, ['NonExistentClass']

    assert_raises(NameError) do
      ObjectiveC::NonExistentClass
    end
  end
end
