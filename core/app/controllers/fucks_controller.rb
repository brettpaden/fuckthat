class FuckError < StandardError
  attr_accessor :status
  
  def initialize(status)
    @status = status
  end
end

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
    
    # Respond JSON only, with exception protection    
    begin
      respond_to do |format|
        if err 
          # Result of eager loading
          format.json { render json: err, status: :internal_server_error }
        else
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
        format.json { render json: err, status: :internal_server_error }
      end
    end
  end

  # GET /fucks/1
  # GET /fucks/1.json
  def show
    begin
      @fuck = Fuck.find(params[:id])
      respond_to do |format|
        format.json { render json: @fuck }
      end
    rescue => err
      $log.warn(err)
      respond_to do |format|
        format.json { render json: err, status: :internal_server_error }
      end
    end
  end

  # Helper fuck-creation routine
  def create_fuck
    status = :internal_server_error 
    begin
      # Must have an instance id
      params[:instance_id] || 
        (raise FuckError.new(:forbidden), "Attempt to create fuck with no instance ID")

      # Session fucker must match the fuck's fucker
      session[:fucker] || (raise FuckError.new(:forbidden), "No current fucker")
      (session[:fucker].id == @fuck.fucker_id) || (raise FuckError.new(:forbidden), "Fucker not authorized")
      
      # Ensure a fuck for this url and fucker does not already exist
      Fuck.first(:conditions => {:fucker_id => @fuck.fucker_id, :that_id => @fuck.that_id}) &&
        (raise FuckError.new(:forbidden), "Fucker has already fucked that.")

      # Increment the 'that's fuck count
      @fuck.that.fuck_count += 1 
  
      @fuck.transaction do
        begin
          # Note, associated 'that' is automatically saved through the :autosave property of Fuck.that
          @fuck.save!

          # Create new event for this new fuck
          @event = Event.new(
            :fuck_id => @fuck.id, 
            :fucker_id => @fuck.fucker_id,
            :that_id => @fuck.that_id,
            :withdraw => false,
            :fuck_created_at => nil,
            :instance_id => params[:instance_id].to_s
          )
          @event.save!
        rescue => err
          raise FuckError.new(:unprocessable_entity), err
        end
      end
 
      # Render as JSON
      respond_to do |format|
        format.json { render json: @fuck, status: :created, location: @fuck }
      end
    rescue FuckError => e 
      $log.warn(e.message)
      respond_to do |format|
        format.json { render json: e.message, status: e.status }
      end
    end
  end
  
  # POST /fucks
  # POST /fucks.json
  def create
    @fuck = Fuck.new(params[:fuck])
    create_fuck 
  end

  # PUT /fucks/1
  # PUT /fucks/1.json
  def update
#    @fuck = Fuck.find(params[:id])
    
    # Error, can't update a fuck, at least for now...
    err = "Attempt to update fuck #{params[:id]} failed"
    $log.warn(err)
    respond_to do |format|
      format.json { render json: err, status: :forbidden }
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

  # Helper fuck deletion routine
  def delete_fuck
    status = :internal_server_error
    begin
      # Must have an instance id
      params[:instance_id] || 
        (raise FuckError.new(:forbidden), "Attempt to delete fuck with no instance ID")

      # Session fucker must match the fuck's fucker
      session[:fucker] || (raise FuckError.new(:forbidden), "No current fucker")
      (session[:fucker].id == @fuck.fucker_id) || (raise FuckError.new(:forbidden), "Fucker not authorized")
      
      # Decrement the 'that's' fuck count
      @fuck.that.fuck_count -= 1 
      
      # Delete, save that, create event
      Fuck.transaction do
        begin
          @fuck.that.save!
          @fuck.destroy
          
          # Create new event for the fuck withdrawal
          @event = Event.new(
            :fuck_id => @fuck.id, 
            :fucker_id => @fuck.fucker_id,
            :that_id => @fuck.that_id,
            :withdraw => true,
            :fuck_created_at => @fuck.created_at,
            :instance_id => params[:instance_id].to_s
          )
          @event.save!
        rescue => err
          raise FuckError.new(:unprocessable_entity), err
        end
      end
      
      # Render JSON
      respond_to do |format|
        format.json { head :no_content }
      end
    rescue FuckError => e
      $log.warn(e.message)
      respond_to do |format|
        format.json { render json: e.message, status: e.status }
      end
    end      
  end
  
  # DELETE /fucks/1
  # DELETE /fucks/1.json
  def destroy
    @fuck = Fuck.find_by_id(params[:id])
    if @fuck
      delete_fuck
    else
      err = "Fucker hasn't fucked that."
      $log.warn(err)
      respond_to do |format|
        format.json {render json: err, status: :forbidden }
      end
    end
  end
  
  # POST /fucks/fuckthat
  # A fuckthat from the web, with url and facebook id passed in
  def fuckthat
    status = :internal_server_error
    begin
      # Make sure we have a current fucker and a url
      session[:fucker] || (raise FuckError.new(:forbidden), "No current fucker")
      (params[:url] && params[:url].length > 0) || (raise FuckError.new(:forbidden), "No URL")
      That.transaction do
        begin
          # Does the that already exist?
          that = That.first(:conditions => {:url => params[:url]})
          if !that
            # No, create it
            that = That.new({:url => params[:url], :title => params[:title]})
            that.save!
          end

          # Create the fuck
          @fuck = Fuck.new({:fucker_id => session[:fucker].id, :that_id => that.id})
          create_fuck
          return # create_fuck renders on its own
        rescue => err
          raise FuckError.new(:unprocessable_entity), err
        end
      end
    rescue FuckError => e
      $log.warn(e.message)
      respond_to do |format|
        format.json { render json: e.message, status: e.status }
      end
    end
  end

  # DELETE /fucks/fuckthat
  # Delete a fuck from the web, with url and facebook id passed in
  def unfuckthat
    status = :internal_server_error
    begin
      # Make sure we have a current fucker and a url
      session[:fucker] || (raise FuckError.new(:forbidden), "No current fucker")
      (params[:url] && params[:url].length > 0) || (raise FuckError.new(:forbidden), "No URL")

      That.transaction do
        begin
          # Get the that
          (that = That.first(:conditions => {:url => params[:url]})) ||
            (raise FuckError.new(:forbidden), "Unknown URL: #{params[:url]}")

          # Get the fuck
          (@fuck = Fuck.first(:conditions => {:fucker_id => session[:fucker].id, :that_id => that.id})) ||
            (raise FuckError.new(:unprocessable_entity), "Fucker hasn't fucked that.")

          delete_fuck # delete_fuck renders on its own
          return
        rescue => err
          raise FuckError.new(:unprocessable_entity), err
        end
      end
    rescue FuckError => e
      $log.warn(e.message)
      respond_to do |format|
        format.json { render json: e.message, status: e.status }
      end
    end
  end
  
  # GET /fucks/get_fuckthat
  # Get a fuck based on current fucker and content
  def get_fuckthat
    # Valid fucker?
    if session[:fucker]
      # Valid url?
      that = That.first(:conditions => {:url => params[:url]})
      if that
        # Have a fuck?
        fuck = Fuck.first(:conditions => {:fucker_id => session[:fucker].id, :that_id => that.id})
        if (fuck)
          respond_to do |format|
            format.json { render json: fuck, :callback => params[:callback] }
          end
        end
      end
    end
    if !fuck
      # Not found
      respond_to do |format|
        format.json { head :no_content }
      end
    end
  end
  
  # POST /fucks/get_fuckthats
  # This is a POST because the query parameters could likely exceed the allowed size for a GET,
  #  even though this is an idempotent call
  # Get an array of fucks based on current fucker and array of urls
  def get_fuckthats
    info = {}
    if params[:urls]
      # Expect array of URLs, return that and my_fuck for each url found
      params[:urls].each do |url,x|
        # Find that
        that = That.first(:conditions => {:url => url})
        if that
          # Have a fuck for this fucker?
          info[url] = {
            :that => that,
            :my_fuck => (session[:fucker] ? Fuck.first(:conditions => {:fucker_id => session[:fucker].id, :that_id => that.id}) : nil)
          }
        end
      end
    end
    respond_to do |format|
      format.json { render json: info }
    end
  end
end
