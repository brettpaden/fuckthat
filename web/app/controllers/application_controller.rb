class ApplicationController < ActionController::Base
  protect_from_forgery

  def initialize 
    super
    $log = Logger.new("/tmp/ftw.log")
    $log.level = Logger::DEBUG
  end
end
