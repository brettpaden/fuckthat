require 'json'

class ApplicationController < ActionController::Base
	protect_from_forgery

	def initialize 
		super
		ga_json = File.read("#{ENV['SRCTOP']}/#{ENV['PROJECT']}/etc/google-analtics-accounts.json")
		google_analytics_codes = JSON.parse(ga_json)
		if ENV['BUMMER_ENVIRONMENT'] == 'prod' 
			@google_analytics_code = google_analytics_codes['prod']
		else
			@google_analytics_code = google_analytics_codes['dev']
		end
	end
end
