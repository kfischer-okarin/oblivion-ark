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
