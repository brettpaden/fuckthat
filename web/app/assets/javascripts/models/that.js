var That = Backbone.Model.extend({
  urlRoot:"/api/thats",
  defaults:{
      "id":null,
      "url":"",
      "title":"",
      "fuck_count":0,
  },
  
  initialize: function(){
  },
  
  // Update that's fuck count based on addition or withdrawal of a fuck
  update_fucks: function(withdraw, old_fuck_created_at) {
    var fuck_count = this.get('fuck_count');
    if (withdraw) {
      var month_before = this.time_collected-1000*60*60*24*30;
      var week_before = this.time_collected-1000*60*60*24*7;
      var day_before = this.time_collected-1000*60*60*24;
      if (old_fuck_created_at > month_before) {
        this.month_fuck_count--;
      } 
      if (old_fuck_created_at > week_before) {
        this.week_fuck_count--;
      }
      if (old_fuck_created_at > day_before) {
        this.day_fuck_count--;
      }
      fuck_count--;
    } else {
      fuck_count++;
      this.month_fuck_count++;
      this.week_fuck_count++;
      this.day_fuck_count++;
    } 
    this.set({fuck_count: fuck_count});
  },
});

var Thats = Backbone.Collection.extend({
  model: That,
  
  intitalize: function(){
  },
  
  // Set for showing only thats that the passed user has fucked
  showMyThats: function(fucker_id) {
    _.each (this.models, function(that) {
      that.hide = !that.my_fuck || that.my_fuck.get('fucker_id') != fucker_id;
    });
  },

  // Set for showing all thats
  showAllThats: function() {
    _.each (this.models, function(that) {
      that.hide = false;
    });
  },

  // Sort thats by fuck count
  sortByFucks: function() {
    this.comparator = function(that) {
      // Also sorts in reverse date order, to make sure sorted order is unambiguous
      return -that.get('fuck_count')-((Date.parse(that.get('created_at')))/(0xffffffff*1.0));
    };
    this.sort();
  },

  // Sort thats by this month's fuck count
  sortByMonthFucks: function() {
    this.comparator = function(that) {
      // Also sorts in reverse date order, to make sure sorted order is unambiguous
      return -that.month_fuck_count-((Date.parse(that.get('created_at')))/(0xffffffff*1.0));
    };
    this.sort();
    _.each (this.models, function(that) {
      that.hide = that.month_fuck_count == null;
    });
  },

  // Sort thats by this week's fuck count
  sortByWeekFucks: function() {
    this.comparator = function(that) {
      // Also sorts in reverse date order, to make sure sorted order is unambiguous
      return -that.week_fuck_count-((Date.parse(that.get('created_at')))/(0xffffffff*1.0));
    };
    _.each (this.models, function(that) {
      that.hide = that.week_fuck_count == null;
    });
    this.sort();
  },

  // Sort thats by today's fuck count
  sortByTodayFucks: function() {
    this.comparator = function(that) {
      // Also sorts in reverse date order, to make sure sorted order is unambiguous
      return -that.day_fuck_count-((Date.parse(that.get('created_at')))/(0xffffffff*1.0));
    };
    _.each (this.models, function(that) {
      that.hide = that.day_fuck_count == null;
    });
    this.sort();
  },

  // Sort thats by most recent date
  sortByDate: function() {
    this.comparator = function(that) {
      return -(Date.parse(that.get('created_at')))-(that.get('fuck_count')/(0xffffffff*1.0));
    };
    this.sort();
  },
  
  // Show only top N thats (assumes already sorted)
  showTopN: function(n) {
    var len = this.models.length;
    var cnt = 0;
    for (var i = 0; i < len; i++) {
      if (cnt < n && !this.models[i].hide) {
        cnt++;
      } else {
        this.models[i].hide = true;
      }
    }
  },
  
  // Fetch thats displayed according to 'what'
  index: function(what, callback) {
    this.fetch({
      url: this.url+'?what='+what,
      success: callback
    });
  },
});
    
