class ThatsController < ApplicationController
  # GET /thats
  # GET /thats.json
  def index
    # Collect, with exception protection 
    # Note that this is "lazy" collection, the query itself will be performed upon render
    begin
#      @thats = That.
#        where(params[:url] ? {:url => params[:url]} : nil).
#        offset(params[:start]).
#        limit(params[:limit]).
#        order(params[:sort])
      
      # This is eager loading, and apparently will be deprecated in Rails 3.2...?
      @thats = That.all( 
        :conditions => params[:url] ? {:url => params[:url]} : nil,
        :order => params[:sort] || nil, 
        :offset => params[:start] || nil, 
        :limit => params[:limit] || nil)
    rescue => err
      $log.warn(err)
    end
    
    # Respond HTML or JSON, with exception protection    
    begin
      respond_to do |format|
        if err 
          # Result of eager loading
          format.html { redirect_to thats_path, notice: "Error collecting thats: #{err}" }
          format.json { render json: err, status: :unprocessable_entity }
        else 
          format.html # index.html.erb
          format.json { render json: @thats }
        end
      end
    rescue => err
      # Result of lazy loading
      $log.warn(err)
      respond_to do |format|
        format.html { redirect_to thats_path, notice: "Error collecting thats: #{err}" }
        format.json { render json: err, status: :unprocessable_entity }
      end
    end    
  end

  # GET /thats/1
  # GET /thats/1.json
  def show
    @that = That.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @that }
    end
  end

  # GET /thats/new
  # GET /thats/new.json
  def new
    @that = That.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @that }
    end
  end

  # GET /thats/1/edit
  def edit
    @that = That.find(params[:id])
  end

  # POST /thats
  # POST /thats.json
  def create
    @that = That.new(params[:that])
    @that.fuck_count = 0
    
    respond_to do |format|
      if @that.save
        format.html { redirect_to @that, notice: 'That was successfully created.' }
        format.json { render json: @that, status: :created, location: @that }
      else
        format.html { render action: "new" }
        format.json { render json: @that.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /thats/1
  # PUT /thats/1.json
  def update
    @that = That.find(params[:id])

    # Error, can't update a that through interface, at least for now...
    $log.warn "Attempt to update that #{@that.id} failed"
    respond_to do |format|
      @that.errors.add :url, notice: "can't be updated."
      format.html { redirect_to thats_path, notice: "That can't be updated."}
      format.json { render json: @that.errors, status: :unprocessable_entity }
    end
    
#   Original generated code 
#    respond_to do |format|
#      if @that.update_attributes(params[:that])
#        format.html { redirect_to @that, notice: 'That was successfully updated.' }
#        format.json { head :no_content }
#      else
#        format.html { render action: "edit" }
#        format.json { render json: @that.errors, status: :unprocessable_entity }
#      end
#    end
  end

  # DELETE /thats/1
  # DELETE /thats/1.json
  def destroy
    @that = That.find(params[:id])
    @that.destroy

    respond_to do |format|
      format.html { redirect_to thats_url }
      format.json { head :no_content }
    end
  end
  
  # GET /thats/data
  def data
    # Build a single JSON object representing all data that a client will be
    # interested in for displaying a single screen
    # This consists of: 
    #  - current session id
    #  - current fucker id
    #  - top 25 thats of all time
    #  - top 25 thats this month
    #  - top 25 thats this week
    #  - top 25 thats today
    #  - hash of fuck_counts for each set of top thats
    #  - the current fucker's fucks
    #  - all thats associated with current fucker's fucks
    #  - the time all this info was collected, in milliseconds since epoch
    info = {:thats => [], :fuckers => [], :fucks => [], 
      :month_fuck_counts => {}, :week_fuck_counts => {}, :day_fuck_counts => {}}
    
    # Get current session id
    info[:session_id] = request.session[:session_id]

    # Get current fucker, put in fucker_id, and add to fuckers array
    info[:fucker_id] = session[:fucker] ? session[:fucker].id : nil;
    info[:fuckers] << session[:fucker] unless !session[:fucker];
    
    # Get all relevant thats
    limit = 25
    info[:time] = Time.now.gmtime
    info[:thats] = That.top_thats(limit, info[:thats])
    info[:month_fuck_counts] = That.top_thats_since(info[:time]-60*60*24*30, limit, info[:thats])
    info[:week_fuck_counts] = That.top_thats_since(info[:time]-60*60*24*7, limit, info[:thats])
    info[:day_fuck_counts] = That.top_thats_since(info[:time]-60*60*24, limit, info[:thats])

    # Get current fucker's fucks
    info[:fucks] = Fuck.fucks_by_fucker(info[:fucker_id]) if info[:fucker_id]
    
    # Get associated thats
    info[:fucks].each do |fuck|
      that = info[:thats].find {|t| t.id == fuck.that_id}
      info[:thats] << fuck.that unless that
    end
    respond_to do | format|
      format.html
      format.json { render json: info }
    end
  end 
  
  # GET /thats/top
  def top
    @thats = That.thats_by_what('top', session[:fucker] ? session[:fucker].id : nil)

    respond_to do |format|
      format.html { redirect_to thats_path }
      format.json { render json: @thats }
    end
  end
  
  # GET /thats/mine
  def mine
    @thats = That.thats_by_what('mine', session[:fucker] ? session[:fucker].id : nil)

    respond_to do |format|
      format.html { redirect_to thats_path }
      format.json { render json: @thats }
    end
  end
end
