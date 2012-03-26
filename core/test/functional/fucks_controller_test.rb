require 'test_helper'

class FucksControllerTest < ActionController::TestCase
  setup do
    @fuck = fucks(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:fucks)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create fuck" do
    assert_difference('Fuck.count') do
      post :create, fuck: @fuck.attributes
    end

    assert_redirected_to fuck_path(assigns(:fuck))
  end

  test "should show fuck" do
    get :show, id: @fuck
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @fuck
    assert_response :success
  end

  test "should update fuck" do
    put :update, id: @fuck, fuck: @fuck.attributes
    assert_redirected_to fuck_path(assigns(:fuck))
  end

  test "should destroy fuck" do
    assert_difference('Fuck.count', -1) do
      delete :destroy, id: @fuck
    end

    assert_redirected_to fucks_path
  end
end
