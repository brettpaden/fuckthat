
class FuckersController < ApplicationController

  # Facebook app constants
  FBGraphServer = 'https://graph.facebook.com/'
  FBAppID =  '293971130693272' 
  FBAppSecret = '00f4e01d27a9474ce9feb4580eaba650'

  # GET /fuckers
  # GET /fuckers.json
  def index
    # Collect, with exception protection 
    # Note that this is "lazy" collection, the query itself will be performed upon render
    begin
      @fuckers = Fucker.
        where(params[:name] ? {:name => params[:name]} : nil).
        order(params[:sort]).
        offset(params[:start]).
        limit(params[:limit])

      # This is eager loading, and apparently will be deprecated in Rails 3.2...?
#      @fuckers = Fucker.all( 
#        :conditions => params[:name] ? {:name => params[:name]} : nil,
#        :order => params[:sort] || nil, 
#        :offset => params[:start] || nil, 
#        :limit => params[:limit] || nil)
    rescue => err
      $log.warn(err)
    end
    
    # Respond JSON only, with exception protection    
    begin
      respond_to do |format|
        if err
          # Result of eager loading
          format.json { render json: err, status: :internal_server_error }
        else
          format.json { render json: @fuckers }
        end
      end
    rescue => err
      # Result of lazy loading
      $log.warn(err)
      respond_to do |format|
        format.json { render json: err, status: :internal_server_error }
      end
    end 
  end

  # GET /fuckers/1
  # GET /fuckers/1.json
  def show
    begin
      @fucker = Fucker.find(params[:id])
      respond_to do |format|
        format.json { render json: @fucker }
      end
    rescue => err
      $log.warn(err)
      respond_to do |format|
        format.json { render json: err, status: :internal_server_error }
      end
    end
  end

  # POST /fuckers
  # POST /fuckers.json
  def create
    @fucker = Fucker.new(params[:fucker])
    respond_to do |format|
      if @fucker.password != params[:confirm] then
        @fucker.errors.add :password, ' confirmation doesn\'t match'
        format.json { render json: @fucker.errors }
      elsif @fucker.save
        format.json { render json: @fucker }
        reset_session
        session[:fucker] = @fucker
        cookies[:fucker_id] = { :value => @fucker.id, :expires => Time.now + 24*3600 }
      else
        format.json { render json: @fucker.errors }
      end
    end
  end

  # PUT /fuckers/1
  # PUT /fuckers/1.json
  def update
    @fucker = Fucker.find(params[:id])

    respond_to do |format|
      if @fucker.update_attributes(params[:fucker])
        format.json { head :no_content }
      else
        format.json { render json: @fucker.errors, status: :internal_server_error }
      end
    end
  end

  # DELETE /fuckers/1
  # DELETE /fuckers/1.json
  def destroy
    @fucker = Fucker.find(params[:id])
    begin
      Fucker.transaction do
        # Decrement each of this fucker's fuck count 
        @fucker.fucks.each do |f|
          f.that.fuck_count -= 1
          f.that.save
        end
        @fucker.destroy
      end
    rescue => err
      err = "Unable to destroy fucker: #{err}"
      $log.warn(err)
    end
    
    respond_to do |format|
      if err
        format.json { render json: err, status: :internal_server_error }
      else
        format.json { head :no_content }
      end
    end
  end
  
  # POST /fuckers/authenticate
  def authenticate
    respond_to do |format|
      @fucker = Fucker.authenticate params[:fucker]['name'], params[:fucker]['password']
      if @fucker
        reset_session
        session[:fucker] = @fucker
        cookies[:fucker_id] = { :value => @fucker.id, :expires => Time.now + 24*3600 }
        format.json { render json: @fucker }
      else
        @fucker = Fucker.new(params[:fucker])
        @fucker.errors.add :password, "is incorrect or fucker is invalid"
        cookies.delete :fucker_id
        format.json {render json: @fucker.errors }
      end
    end
  end

  # POST /fuckers/fb_authenticate
  # Attempt to authenticate passed facebook access token, get or create new fucker
  def fb_authenticate  
    # If we have a new access token, validate it by attempting to get 'me',
    # the logged in facebook user
    if params[:access_token]
      begin
        rg = RestGraph.new(:access_token => params[:access_token],
          :graph_server => FBGraphServer,
          :app_id       => FBAppID,
          :secret       => FBAppSecret)
        me = rg.get('me')
      rescue => err
        # Unable to get me, this is not a valid acces token
      end
    end

    # Find the fucker associated with the facebook id
    if me
      session[:fucker] = Fucker.first(:conditions => {:facebook_id => me['id']})
      if !session[:fucker]
        session[:fucker] = Fucker.new({:name => me['name'], :facebook_id => me['id']})
        if !session[:fucker].save
          session[:fucker] = nil
        end
      end
    elsif !params.has_key? :access_token && !session[:fucker]
      # No facebook user and no active active session, reset session
      reset_session
      params[:access_token] = nil
    end
 
    # Explicitly provide CSRF token in a cookie, since a new one will be generated 
    # and we will need it to do non-idempotent actions
    # Also store facebook access token
    cookies['CSRF-Token'] = session[:fucker] ? form_authenticity_token : nil
    session['FB-Token'] = params[:access_token]
    
    # Create a random instance id
    instance_id = (rand * 0xffffffff).to_i;

    # Return the fucker
    respond_to do |format|
      format.json { render json: {:instance_id => instance_id, :fucker => session[:fucker], 
        :csrf_token => cookies['CSRF-Token']}}
    end
  end

  # logout
  def logout
    do_logout
    respond_to do |format|
      format.json { render json: 1 }
    end
  end
  
  # do logout
  def do_logout
    reset_session
    session[:fucker] = nil
    cookies.delete :fucker_id
  end
  
  # login
  def login
    @fucker = Fucker.new(params[:user])
    respond_to do |format|
      format.json { render json: @fucker }
    end
  end
  
  # join
  def join
    @fucker = Fucker.new(params[:user])
    respond_to do |format|
      format.json { render json: @fucker }
    end
  end
end
  
