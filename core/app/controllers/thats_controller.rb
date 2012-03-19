class ThatsController < ApplicationController
  # GET /thats
  # GET /thats.json
  def index
    @thats = That.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @thats }
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

    respond_to do |format|
      if @that.update_attributes(params[:that])
        format.html { redirect_to @that, notice: 'That was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @that.errors, status: :unprocessable_entity }
      end
    end
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
