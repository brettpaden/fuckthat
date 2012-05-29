class FuckthatController < ApplicationController
  # GET /
  # fuckthat_button 
  def fuckthat_button
    # Render button template with passed in content
    @content = params[:content]
    @title = params[:title]
    respond_to do |format|
      format.html  # fuckthat_button.html.erb
    end
  end
end  
