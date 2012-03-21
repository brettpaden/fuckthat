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
end
