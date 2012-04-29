require 'test_helper'

class PagesControllerTest < ActionController::TestCase
  test "should get button" do
    get :button
    assert_response :success
  end

end
