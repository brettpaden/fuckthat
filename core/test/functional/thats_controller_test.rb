require 'test_helper'

class ThatsControllerTest < ActionController::TestCase
  setup do
    @that = thats(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:thats)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create that" do
    assert_difference('That.count') do
      post :create, that: @that.attributes
    end

    assert_redirected_to that_path(assigns(:that))
  end

  test "should show that" do
    get :show, id: @that
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @that
    assert_response :success
  end

  test "should update that" do
    put :update, id: @that, that: @that.attributes
    assert_redirected_to that_path(assigns(:that))
  end

  test "should destroy that" do
    assert_difference('That.count', -1) do
      delete :destroy, id: @that
    end

    assert_redirected_to thats_path
  end
end
