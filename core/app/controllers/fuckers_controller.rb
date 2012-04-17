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
    
    # Respond HTML or JSON, with exception protection    
    begin
      respond_to do |format|
        if err
          # Result of eager loading
          format.html { redirect_to fuckers_path, notice: "Error collecting fuckers: #{err}" }
          format.json { render json: err, status: :unprocessable_entity }
        else
          format.html # index.html.erb
          format.json { render json: @fuckers }
        end
      end
    rescue => err
      # Result of lazy loading
      $log.warn(err)
      respond_to do |format|
        format.html { redirect_to fuckers_path, notice: "Error collecting fuckers: #{err}" }
        format.json { render json: err, status: :unprocessable_entity }
      end
    end 
  end

  # GET /fuckers/1
  # GET /fuckers/1.json
  def show
    @fucker = Fucker.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @fucker }
    end
  end

  # GET /fuckers/new
  # GET /fuckers/new.json
  def new
    @fucker = Fucker.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @fucker }
    end
  end

  # GET /fuckers/1/edit
  def edit
    @fucker = Fucker.find(params[:id])
  end

  # POST /fuckers
  # POST /fuckers.json
  def create
    @fucker = Fucker.new(params[:fucker])
    respond_to do |format|
      if @fucker.password != params[:confirm] then
        @fucker.errors.add :password, ' confirmation doesn\'t match'
        format.html { render action: "new" }
        format.json { render json: @fucker.errors }
      elsif @fucker.save
        format.html { redirect_to ''}
        format.json { render json: @fucker }
        session[:fucker] = @fucker
      else
        format.html { render action: "new" }
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
        format.html { redirect_to @fucker, notice: 'Fucker was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @fucker.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /fuckers/1
  # DELETE /fuckers/1.json
  def destroy
    @fucker = Fucker.find(params[:id])
    # Decrement each of this fucker's fuck count ... IS THIS REALLY WHAT WE WANT TO DO???
    @fucker.fucks.each do |f|
      f.that.fuck_count -= 1
      f.that.save
    end
    @fucker.destroy

    respond_to do |format|
      format.html { redirect_to fuckers_url }
      format.json { head :no_content }
    end
  end
  
  # POST /fuckers/authenticate
  def authenticate
    respond_to do |format|
      @fucker = Fucker.authenticate params[:fucker]['name'], params[:fucker]['password']
      if @fucker
        session[:fucker] = @fucker
        format.html { redirect_to fucks_path }
        format.json { render json: @fucker }
      else
        @fucker = Fucker.new(params[:fucker])
        @fucker.errors.add :password, "is incorrect or fucker is invalid"
        format.html {render action: 'login' }
        format.json {render json: @fucker.errors }
      end
    end
  end

  # logout
  def logout
    do_logout
    respond_to do |format|
      format.html { redirect_to fucks_path, notice: 'user logged out.' }
      format.json { render json: 1 }
    end
  end
  
  # do logout
  def do_logout
    session[:fucker] = nil
  end
  
  # login
  def login
    @fucker = Fucker.new(params[:user])
    respond_to do |format|
      format.html # login.html.erb
      format.json { render json: @fucker }
    end
  end
end
  
