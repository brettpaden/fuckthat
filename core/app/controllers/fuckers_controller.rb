
class FuckersController < ApplicationController
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
        $log.debug("Set fucker to #{session[:fucker].inspect}")
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
  # Attempt to 
  def fb_authenticate
    
    
    
 rg = RestGraph.new(:access_token => params[:access_token],
                    :graph_server => 'https://graph.facebook.com/',
                    :app_id       => '293971130693272'  ,
                    :secret       => '00f4e01d27a9474ce9feb4580eaba650')
 me = rg.get('me')
$log.debug(me.inspect)
   
    respond_to do |format|
      format.json { render json: me }
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
  
