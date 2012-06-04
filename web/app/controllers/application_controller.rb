class ApplicationController < ActionController::Base
  protect_from_forgery

  def initialize 
    super
    $log = Logger.new("/tmp/ftw-" + ENV['USER'] + ".log")
    $log.level = Logger::DEBUG
  end
end
