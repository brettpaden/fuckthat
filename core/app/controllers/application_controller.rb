class ApplicationController < ActionController::Base
  protect_from_forgery

  def initialize 
    super
    $log = Logger.new("/tmp/ftc.log")
    $log.level = Logger::DEBUG
  end
end



