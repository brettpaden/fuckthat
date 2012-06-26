class ErrorsController < ApplicationController
  # POST /client_error
  # Output error messages to STDERR, where they will go into the web server logs, per FTHAT-3
  def log  
    $stderr.puts "[#{Time.now.strftime('%Y-%m-%d %H:%M:%S')}] CLIENT ERROR - #{params[:data]}" unless !params[:data]
    respond_to do |format|
      format.html { head :ok }
    end
  end
end