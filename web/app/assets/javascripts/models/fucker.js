Fucker = Backbone.Model.extend({
  urlRoot:"/api/fuckers",
  defaults:{
      "id":null,
      "name":"",
      "password_digest":"",
  },
  initialize: function(){
  },
});

var Fuckers = Backbone.Collection.extend({
  model: Fucker,
  
  intitalize: function(){
  },
});
    
