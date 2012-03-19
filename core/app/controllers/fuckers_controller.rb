class FuckersController < ApplicationController
  # GET /fuckers
  # GET /fuckers.json
  def index
    @fuckers = Fucker.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @fuckers }
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
      if @fucker.save
        format.html { redirect_to @fucker, notice: 'Fucker was successfully created.' }
        format.json { render json: @fucker, status: :created, location: @fucker }
      else
        format.html { render action: "new" }
        format.json { render json: @fucker.errors, status: :unprocessable_entity }
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
    @fucker.destroy

    respond_to do |format|
      format.html { redirect_to fuckers_url }
      format.json { head :no_content }
    end
  end
end
