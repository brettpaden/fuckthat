class FucksController < ApplicationController

  # GET /fucks
  # GET /fucks.json
  def index
    # Form conditions
    conditions = {} 
    if params[:fucker_id] then
      # Support fucker_id
      conditions[:fucker_id] = params[:fucker_id] 
    elsif params[:fucker] then
      # Support 'fucker' lookup
      conditions['fuckers.name'] = params[:fucker]
    elsif params[:name] then
      # Support 'fucker' lookup, by name
      conditions['fuckers.name'] = params[:name]
    end
    if params[:that_id] then
      # Support that_id
      conditions[:that_id] = params[:that_id]
    elsif params[:that] then
      # Support 'that' lookup
      conditions['thats.url'] = params[:that]
    elsif params[:url] then
      # Support 'that' lookup, by url
      conditions['thats.url'] = params[:url]
    end
    
    # Collect, with exception protection
    # Note that this is "lazy" collection, the query itself will be performed upon render
    begin
      @fucks = Fuck.
        joins([:fucker, :that]).
        where(conditions).
        order(params[:sort]).
        offset(params[:start]).
        limit(params[:limit])
      if params[:count] then @fuck_count = @fucks.count end

      # This is eager loading, and apparently will be deprecated in Rails 3.2...?
#      @fucks = Fuck.all(
#        :include => ['fucker', 'that'],
#        :conditions => conditions,
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
          format.html { redirect_to fucks_path, notice: "Error collecting fucks: #{err}" }
          format.json { render json: err, status: :unprocessable_entity }
        else
          format.html # index.html.erb
          if @fuck_count
            format.json {render json: @fuck_count }
          else
            format.json {render json: @fucks }
          end
        end
      end
    rescue => err
      # Result of lazy loading
      $log.warn(err)    
      respond_to do |format|
        format.html { redirect_to fucks_path, notice: "Error collecting fucks: #{err}" }
        format.json { render json: err, status: :unprocessable_entity }
      end
    end
  end

  # GET /fucks/1
  # GET /fucks/1.json
  def show
    @fuck = Fuck.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @fuck }
    end
  end

  # GET /fucks/new
  # GET /fucks/new.json
  def new
    @fuck = Fuck.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @fuck }
    end
  end

  # GET /fucks/1/edit
  def edit
    @fuck = Fuck.find(params[:id])
  end

  # POST /fucks
  # POST /fucks.json
  def create
    @fuck = Fuck.new(params[:fuck])
    # Ensure a fuck for this url and fucker does not already exist
    if Fuck.first(:conditions => {:fucker_id => params['fuck']['fucker_id'], :that_id => params['fuck']['that_id']}) then
      $log.warn('fucker has already fucked that')
      @fuck.errors.add :fucker_id, 'has already fucked that.'
    else
      @fuck.that.fuck_count += 1  # Increment the 'that's fuck count
    end
    
    respond_to do |format|
      # Note, associated 'that' is automatically saved through the :autosave property of Fuck.that
      if @fuck.errors.empty? && @fuck.save 
        # Create new event for this new fuck
        @event = Event.new(
          :fuck_id => @fuck.id, 
          :fucker_id => session[:fucker] ? session[:fucker].id : nil,
          :that_id => @fuck.that_id,
          :withdraw => false,
          :fuck_created_at => nil,
          :session_id => request.session[:session_id]
        )
        @event.save
        format.html { redirect_to @fuck, notice: 'Fuck was successfully created.' }
        format.json { render json: @fuck, status: :created, location: @fuck }
      else
        format.html { render action: "new" }
        format.json { render json: @fuck.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /fucks/1
  # PUT /fucks/1.json
  def update
    @fuck = Fuck.find(params[:id])
    
    # Error, can't update a fuck, at least for now...
    $log.warn "Attempt to update fuck #{@fuck.id} failed"
    respond_to do |format|
      @fuck.errors.add :url, notice: "can't be updated."
      format.html { redirect_to fucks_path, notice: "Fuck can't be updated."}
      format.json { render json: @fuck.errors, status: :unprocessable_entity }
    end
    
    # Original generated code    
#    respond_to do |format|
#      if @fuck.update_attributes(params[:fuck])
#        format.html { redirect_to @fuck, notice: 'Fuck was successfully updated.' }
#        format.json { head :no_content }
#      else
#        format.html { render action: "edit" }
#        format.json { render json: @fuck.errors, status: :unprocessable_entity }
#      end
#    end
  end

  # DELETE /fucks/1
  # DELETE /fucks/1.json
  def destroy
    @fuck = Fuck.find(params[:id])
    @fuck.that.fuck_count -= 1  # Decrement the 'that's' fuck count
    @fuck.that.save
    @fuck.destroy
    # Create new event for the fuck withdrawal
    @event = Event.new(
      :fuck_id => @fuck.id, 
      :fucker_id => session[:fucker] ? session[:fucker].id : nil,
      :that_id => @fuck.that_id,
      :withdraw => true,
      :fuck_created_at => @fuck.created_at,
      :session_id => request.session[:session_id]
    )
    @event.save
    
    respond_to do |format|
      format.html { redirect_to fucks_url }
      format.json { head :no_content }
    end
  end
end
