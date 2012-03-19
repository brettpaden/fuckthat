class FucksController < ApplicationController
  # GET /fucks
  # GET /fucks.json
  def index
    @fucks = Fuck.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @fucks }
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

    respond_to do |format|
      if @fuck.save
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

    respond_to do |format|
      if @fuck.update_attributes(params[:fuck])
        format.html { redirect_to @fuck, notice: 'Fuck was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @fuck.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /fucks/1
  # DELETE /fucks/1.json
  def destroy
    @fuck = Fuck.find(params[:id])
    @fuck.destroy

    respond_to do |format|
      format.html { redirect_to fucks_url }
      format.json { head :no_content }
    end
  end
end
