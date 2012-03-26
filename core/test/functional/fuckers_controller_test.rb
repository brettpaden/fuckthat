require 'test_helper'

class FuckersControllerTest < ActionController::TestCase
  setup do
    @fucker = fuckers(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:fuckers)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create fucker" do
    assert_difference('Fucker.count') do
      post :create, fucker: @fucker.attributes
    end

    assert_redirected_to fucker_path(assigns(:fucker))
  end

  test "should show fucker" do
    get :show, id: @fucker
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @fucker
    assert_response :success
  end

  test "should update fucker" do
    put :update, id: @fucker, fucker: @fucker.attributes
    assert_redirected_to fucker_path(assigns(:fucker))
  end

  test "should destroy fucker" do
    assert_difference('Fucker.count', -1) do
      delete :destroy, id: @fucker
    end

    assert_redirected_to fuckers_path
  end
end
