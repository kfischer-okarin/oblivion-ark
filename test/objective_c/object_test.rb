require 'minitest/autorun'

require_relative '../test_helpers'
require_relative '../../lib/objective_c'

describe ObjectiveC::Object do
  include ResetObjectiveCConstants
  include WithFFIMock
  include Factories

  let(:obj) { ObjectiveC::Object.new(build_a_pointer) }

  it 'can get its own class' do
    class_pointer = build_a_pointer
    ffi.expect :object_getClass, class_pointer, [obj]

    result = obj.objc_class
    result2 = obj.objc_class

    assert_equal class_pointer, result
    assert_equal class_pointer, result2
  end

  it 'can send a method' do
    ffi.expect(:sel_getUid, :selector, ['a_method'])

    obj.a_method
  end
end
