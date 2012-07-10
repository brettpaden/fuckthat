class PagesController < ActionController::Base
  require 'net/http'
  def init_facebook_access_token
  end
  def obtain_facebook_access_token
    secret = '8576db6dcefca668df6eacaf9d1dd1b4'
    appid = '379083178817736'
    uri = URI(
      'https://graph.facebook.com/oauth/access_token?' +
      'client_id=' + appid +
      '&redirect_uri=' + CGI.escape("http://ENV['BUMMER_DOMAIN']:ENV['BUMMER_WEB_PORT']/pages/obtain_facebook_access_token") +  
      '&client_secret=' + secret + 
      '&code=' + params[:code]
    )
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Get.new(uri.request_uri)
    @res = http.request(request)
  end
end
