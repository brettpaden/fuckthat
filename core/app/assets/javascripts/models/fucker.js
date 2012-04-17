Fucker = Backbone.Model.extend({
  urlRoot:"/fuckers",
  defaults:{
      "id":null,
      "name":"",
      "password_digest":"",
  },
  initialize: function(){
  },
});

var Fuckers = Backbone.Collection.extend({
  url: "/fuckers",
  model: Fucker,
  
  intitalize: function(){
  },
});
    
