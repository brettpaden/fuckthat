var Event = Backbone.Model.extend({
  urlRoot:"/events",
  defaults:{
      "id":null,
      "fuck_id":null,
      "withdraw":false,
  },
  
  initialize: function(){
  },
});

var Events = Backbone.Collection.extend({
  url: "/events",
  model: Event,
  
  intitalize: function(){
  },
  
  index: function(callback) {
    this.fetch({
      success: callback
    });
  },
  
});
