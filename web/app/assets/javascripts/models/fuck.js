Fuck = Backbone.Model.extend({
  urlRoot:"/api/fucks",
  defaults:{
      "id":null,
      "that_id":null,
      "fucker_id":null,
  },
  initialize: function(){
  },
});

var Fucks = Backbone.Collection.extend({
  model: Fuck,
  
  intitalize: function(){
  },
});
    
