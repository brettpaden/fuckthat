Web::Application.routes.draw do
  get '/pages/init_facebook_access_token'
  get '/pages/obtain_facebook_access_token'
  root :to => 'fuckthats#main'
end

