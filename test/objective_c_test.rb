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

module WithFFIMock
  extend Minitest::Spec::DSL

  let(:ffi) { Minitest::Mock.new }

  before do
    ObjectiveC.ffi = ffi
  end

  after do
    ffi.verify
  end
end

describe ObjectiveC do
  include ResetObjectiveCConstants
  include WithFFIMock

  let(:any_address) { rand(0xFFFFFFFF) }

  it 'can dynamically reference classes' do
    ns_string_address = 1234
    ffi.expect :objc_getClass, ns_string_address, ['NSString']

    klass = ObjectiveC::NSString

    assert_equal ns_string_address, klass.address
  end

  it 'only loads classes once' do
    ffi.expect :objc_getClass, any_address, ['NSString']

    first_time = ObjectiveC::NSString
    second_time = ObjectiveC::NSString

    assert_equal second_time, first_time
  end
end
