class ApplicationController < ActionController::Base
  protect_from_forgery
  
  def initialize 
    super
    $log = Logger.new("rails.log")
    $log.level = Logger::DEBUG
    $log.debug('hello')
  end
end
