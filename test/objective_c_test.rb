require 'minitest/autorun'

require '../lib/objective_c'

describe ObjectiveC do
  it 'can dynamically reference classes' do
    ns_string_address = 1234
    ffi_mock = Minitest::Mock.new
    ObjectiveC.ffi = ffi_mock
    ffi_mock.expect :objc_getClass, ns_string_address, ['NSString']

    klass = ObjectiveC::NSString

    assert_equal ns_string_address, klass.address
    ffi_mock.verify
  end
end
