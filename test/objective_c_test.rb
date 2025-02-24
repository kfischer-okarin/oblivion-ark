require 'minitest/autorun'

require '../lib/objective_c'

module ResetObjectiveCConstants
  extend Minitest::Spec::DSL

  before do
    @original_constants = ObjectiveC.constants.dup
  end

  after do
    (ObjectiveC.constants - @original_constants).each do |const|
      ObjectiveC.send(:remove_const, const)
    end
  end
end

describe ObjectiveC do
  include ResetObjectiveCConstants

  it 'can dynamically reference classes' do
    ns_string_address = 1234
    ffi_mock = Minitest::Mock.new
    ObjectiveC.ffi = ffi_mock
    ffi_mock.expect :objc_getClass, ns_string_address, ['NSString']

    klass = ObjectiveC::NSString

    assert_equal ns_string_address, klass.address
    ffi_mock.verify
  end

  it 'only loads the class once' do
    ns_string_address = 1234
    ffi_mock = Minitest::Mock.new
    ObjectiveC.ffi = ffi_mock
    ffi_mock.expect :objc_getClass, ns_string_address, ['NSString']

    first_time = ObjectiveC::NSString
    second_time = ObjectiveC::NSString

    assert_equal second_time, first_time
    ffi_mock.verify
  end
end
