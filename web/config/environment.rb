# Load the rails application
require File.expand_path('../application', __FILE__)

# Set all errors to go to STDERR, where they will be displayed in the error log of the web server
Rails.logger = Logger.new(STDERR)

# Initialize the rails application
Web::Application.initialize!
