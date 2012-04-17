Fuck = Backbone.Model.extend({
  urlRoot:"/fucks",
  defaults:{
      "id":null,
      "that_id":null,
      "fucker_id":null,
  },
  initialize: function(){
  },
});

var Fucks = Backbone.Collection.extend({
  url: "/fucks",
  model: Fuck,
  
  intitalize: function(){
  },
});
    
