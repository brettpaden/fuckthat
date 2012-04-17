class ApplicationController < ActionController::Base
  protect_from_forgery
  
  def initialize 
    super
    $log = Logger.new("/u/colin/rails.log")
    $log.level = Logger::DEBUG
  end
end
