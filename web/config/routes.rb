Web::Application.routes.draw do
  get 'pages/embed_button'
  root :to => 'fuckthats#main'
end
