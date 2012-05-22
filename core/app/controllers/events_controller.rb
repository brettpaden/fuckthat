class EventsController < ApplicationController
  # GET /events	
  # GET /events.json
  def index    
    # Get events since timestamp provided in params
    @events = Event.events_since_id(params[:since_id], nil)

    # Get associated thats if needed, along with current user's associated fuck
    if params[:need_thats]
      info = {:fucks => [], :thats => [], :events => []}
      @events.each do |e|
        # Add the event
        info[:events] << e
        # Add the fuck
        fuck = Fuck.find_by_id(e.fuck_id) 
        info[:fucks] << fuck unless !fuck || info[:fucks].find{|f| f.id == fuck.id}
        # Add the that
        that = That.find_by_id(e.that_id)
        info[:thats] << that unless !that || info[:thats].find{|t| t.id == that.id}
        # Get my fuck for this that, add to collection
        my_fuck = session[:fucker] && that ? that.my_fuck(session[:fucker].id) : nil
        info[:fucks] << my_fuck unless !my_fuck || info[:fucks].find{|f| f.id == my_fuck.id}
      end
    end
        
    respond_to do |format|
      if params[:need_thats]
        format.json { render json: info }
      else 
        format.json { render json: @events }
      end
    end
  end

  # GET /events/1
  # GET /events/1.json
  def show
    @event = Event.find(params[:id])

    respond_to do |format|
      format.json { render json: @event }
    end
  end

  # POST /events
  # POST /events.json
  def create
    @event = Event.new(params[:event])
    respond_to do |format|
      if @event.save
        format.json { render json: @event, status: :created, location: @event }
      else
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /events/1
  # PUT /events/1.json
  def update
    @event = Event.find(params[:id])
    respond_to do |format|
      if @event.update_attributes(params[:event])
        format.json { head :ok }
      else
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /events/1
  # DELETE /events/1.json
  def destroy
    @event = Event.find(params[:id])
    @event.destroy

    respond_to do |format|
      format.json { head :ok }
    end
  end
end
