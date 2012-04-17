// Current fucker (user) and session ID
var SessionFucker = null;
var SessionID = null;

// Javascript templates
var Templates = {
  HeaderTPL: '/header.html.jst',
  ThatsTPL: '/thats.html.jst',
  ThatsPanelTPL: '/thats_panel.html.jst',
  ThatTPL: '/one_that.html.jst',
  LoginTPL: '/login.html.jst',
  TopFucksMenuTPL: '/top_fucks_menu.html.jst',
};
var TemplatesArray = [];
for (var tpl in Templates) { TemplatesArray.push(tpl); }
var TemplateData = [];

// Fetch all templates in TemplatesArray, starting at n if provided, execute calllback when finished 
function fetch_templates(callback, n) {
  if (typeof(n) == 'undefined') {
    n = 0;
  }
  if (n < TemplatesArray.length) {
    $.get(Templates[TemplatesArray[n]], '', function(data){
      TemplateData[TemplatesArray[n]] = data;
      fetch_templates (callback, n+1);
    });
  } else {
    callback();
  }
}

// Router
var AppRouter = Backbone.Router.extend({
 
  // Routes
  routes:{
    "/":"",
    "top":"top",
    "mine":"mine",
    "month":"month",
    "week":"week",
    "today":"today",
  },

  // Current display
  what:'top', 
  
  // Collections
  thats:null,
  fucks:null,
  fuckers:null,
  events:null,
  
  // Fuck counts
  month_fuck_counts:{},
  week_fuck_counts:{},
  day_fuck_counts:{},
  
  // Init
  initialize:function () {
    this.thats = new Thats();
    this.fucks = new Fucks();
    this.fuckers = new Fuckers();
    this.events = new Events();
  },

  // Display top thats
  top:function() {
    // Switch to top tab if already displayed, otherwise render whole page
    var $top_tab = $('#top_thats_tab a');
    if ($top_tab.length > 0) {
      $top_tab.click();
    } else {
      App.what = 'top';
    }
  },
  
  // Display my fucked thats
  mine:function() {
    // Switch to "my" tab if already displayed, otherwise render whole page
    var $my_tab = $('#my_thats_tab a');
    if ($my_tab.length > 0) {
      $my_tab.click();
    } else {
      App.what = 'mine';
    }
  },
  
  // Display my fucked thats
  month:function() {
    // Switch to this month's top if already displayed, otherwise render whole page
    var $month_tab = $('#month_thats_tab a');
    if ($month_tab.length > 0) {
      $month_tab.click();
    } else {
      App.what = 'month';
    }
  },
  
  // Display my fucked thats
  week:function() {
    // Switch to this week's top if already displayed, otherwise render whole page
    var $week_tab = $('#week_thats_tab a');
    if ($week_tab.length > 0) {
      $week_tab.click();
    } else {
      App.what = 'week';
    }
  },
  
  // Display my fucked thats
  today:function() {
    // Switch to today's if already displayed, otherwise render whole page
    var $today_tab = $('#today_thats_tab a');
    if ($today_tab.length > 0) {
      $today_tab.click();
    } else {
      App.what = 'today';
    }
  },
  
  // Get fuck count text according to current "what"
  countTextFromWhat:function(what) {
    switch (what) {
      case 'top':
      case 'Most Fucked (All Time)':
      case 'mine':
      case 'My Fuck Thats':
      default:
        return null;
      case 'month':
      case 'This Month':
        return "THIS MONTH'S";
      case 'week':
      case 'This Week':
        return "THIS WEEK'S";
      case 'today':
      case 'Today':
        return "TODAY'S";
    }
  },
  
  // Get fuck count variable according to current "what"
  fuckCountVarFromWhat:function(what) {
    switch (what) {
      case 'top':
      case 'Most Fucked (All Time)':
      case 'mine':
      case 'My Fuck Thats':
      default:
        return null;
      case 'month':
      case 'This Month':
        return 'month_fuck_count';
      case 'week':
      case 'This Week':
        return 'week_fuck_count';
      case 'today':
      case 'Today':
        return 'day_fuck_count';
    }
  },
  
  // Get descriptive 'when' according to current "what"
  whenFromWhat:function(what) {
    switch (what) {
      case 'top':
      case 'Most Fucked (All Time)':
      case 'mine':
      case 'My Fuck Thats':
      default:
        return 'yet';
      case 'month':
      case 'This Month':
        return 'this month';
      case 'week':
      case 'This Week':
        return 'this week';
      case 'today':
      case 'Today':
        return 'today';
    }
  },
  
  // Called in response to change of logged in 'fucker'
  onFuckerChange:function() {
    // Re-render everything
    App.what = 'top';
    this.renderAll();
  },
  
  // Render thats view per new 'what'
  onWhatChange:function(what) {
    App.what = what;
    
    // Sort and show/hide according to what
    if (what == 'mine' || what == 'My Fuck Thats') {
      this.thats.showMyThats(SessionFucker.id);
      this.thats.sortByDate();
      App.navigate('mine');
    } else {
      switch (what) {
        case 'top':
        case 'Most Fucked (All Time)':
          this.thats.showAllThats();
          this.thats.sortByFucks();
          App.navigate('top');
          break;
        case 'month':
        case 'This Month':
          this.thats.sortByMonthFucks();
          App.navigate('month');
          break;
        case 'week':
        case 'This Week':
          this.thats.sortByWeekFucks();
          App.navigate('week');
          break;
        case 'today':
        case 'Today':
          this.thats.sortByTodayFucks();
          App.navigate('today');
          break;
      }
      this.thats.showTopN(25);
    }
    
    // Re-render
    var count_text = this.countTextFromWhat(what);
    var fuck_count_var = this.fuckCountVarFromWhat(what);
    this.renderThatsPanel(count_text, fuck_count_var, what == 'mine' || what == 'My Fuck Thats',
      App.whenFromWhat(what));
  },

  // Render header
  renderHeader:function() {
    $('#header_div').html(new HeaderView().render().el);
  },
  
  // Render everything
  renderAll:function() {
    // Fetch all displayed data
    $.getJSON('/data', function(data){

      // Populate our collections
      App.thats.reset();
      App.thats.add (data.thats);
      App.month_fuck_counts = data.month_fuck_counts
      App.week_fuck_counts = data.week_fuck_counts
      App.day_fuck_counts = data.day_fuck_counts
      App.fucks.reset();
      App.fucks.add (data.fucks);
      App.fuckers.reset();
      App.fuckers.add (data.fuckers);
      App.events.reset();
      App.time_collected = Date.parse(data.time);
        
      // Establish current fucker and session id
      if (data.fucker_id) {
        SessionFucker = _.find(App.fuckers.models, function(f){
          return f.id == data.fucker_id;
        });
      } else {
        SessionFucker = null;
      }
      SessionID = data.session_id;
      
      // Render header
      App.renderHeader ();
      
      // Connect that objects to other objects
      App.connectThats (App.thats.models);
      
      // Connect fuck objects to other objects
      App.connectFucks (App.fucks.models);
      
      // Render thats
      App.renderThats (true, null, null, App.what == 'mine' || App.what == 'My Fuck Thats', 
        App.whenFromWhat(whatTab()));
      
      // Initialize 
      onThatsLoad ();
    });
  },
  
  // Connect a single fuck to other objects
  connectFuck:function(fuck) {
    fuck.that = _.find(App.thats.models, function(t) {
      t.id == fuck.get('that_id');
    });
  },
  
  // Connect fucks to other objects
  connectFucks:function(fucks) {
    _.each(fucks, function(fuck) {
      App.connectFuck(fuck);
    });
  },
  
  // Connect a single that to other objects
  connectThat:function(that) {
    // Connect to my fuck, if any
    if (SessionFucker) {
      that.my_fuck = _.find (App.fucks.models, function(fuck){
        return fuck.get('that_id') == that.id && fuck.get('fucker_id') == SessionFucker.id;
      }) || null;
    } else {
      that.my_fuck = null;
    }
    // Get month, week, and day fuck counts
    that.month_fuck_count = App.month_fuck_counts[that.id] || null;
    that.week_fuck_count = App.week_fuck_counts[that.id] || null;
    that.day_fuck_count = App.day_fuck_counts[that.id] || null;
  },
  
  // Connect thats to other objects
  connectThats:function(thats) {
    _.each(thats, function(that) {
      App.connectThat(that);
    });
  },
    
  // Render a single that
  renderThat:function(that, $div, count_text, fuck_count_var) {
    if (typeof(that) == 'string') {
      that = this.thats.getByCid(that);
    }
    $div.html(new ThatView().render(that, count_text, fuck_count_var).el);
  },
  
  // Render thats portion
  renderThats:function(no_panel, count_text, fuck_count_var, mine, when) {
    $('#thats_div').html(new ThatsView().render(App.thats, no_panel, count_text, fuck_count_var, mine, when).el);
  },
  
  // Render thats panel
  renderThatsPanel:function(count_text, fuck_count_var, mine, when) {
    new ThatsView().render_panel(App.thats, count_text, fuck_count_var, mine, when);
  },

  // Get the that in the collection following the passed that
  // Returns the cid of the next that, or '+' if the that is the last one, -1 if the that isn't found at all
  getNextThat:function(cid) {
    var len = this.thats.models.length;
    var next_id = -1;
    for (var i = 0; i < len; i++) {
      var that = this.thats.models[i];
      if (that.cid == cid) {
        if (i < len-1) {
          next_id = this.thats.models[i+1].cid;
        } else {
          next_id = '+';
        }
        break;
      }
    }
    return next_id;
  },

  // Connect a single event to other objects
  connectEvent:function(e) {
    e.that = App.thats.get(e.get('that_id'));
  },
    
  // Connect events to other objects
  connectEvents:function(events) {
   // Connect to other objects and render individual events
    _.each(events, function(e) {
      App.connectEvent(e);
    });
  },
  
  // On fucker fucking a that
  onFuck:function(cid, fuck) {
    // Get the current that which is next after this one
    var curr_next_id = this.getNextThat(cid);
    // Search for the that and get its real id
    var that = this.thats.getByCid(cid);
    // Find existing fuck, if any
    var that_id = that.id;
    var fucker_id = SessionFucker.id;
    var my_fuck = _.find(App.fucks.models, function(fuck) { 
      return fuck.get('that_id') == that_id && fuck.get('fucker_id') == fucker_id; }) || null;
    // Update that's fuck count (this is done independently on the server), and re-sort
    that.update_fucks(my_fuck ? true : false, my_fuck ? Date.parse(my_fuck.get('created_at')) : null);
    App.thats.sort();
    // Get new "next" that, this is the position we need to insert to in our display
    var new_next_id = this.getNextThat(cid);
    if (that_id) {
      // Perform the fuck action
      if (!my_fuck && fuck) {
        // Creating a new fuck
        that.my_fuck = App.fucks.create({that_id: that_id, fucker_id: fucker_id});
      } else if (my_fuck && !fuck) {
        // Withdrawing a fuck
        my_fuck.destroy();
        that.my_fuck = null;
        // Remove from display, if displaying my thats
        if (App.what == 'mine' || App.what == 'My Fuck Thats') {
          onRemoveThat(that);
        }
      } else {
        // Shouldn't happen, withdrawing non-existing fuck
      }
    } 
    // Update the that in our display
    onChangeThat(that, curr_next_id == new_next_id ? -1 : new_next_id);
  },
  
  // Respond to new event(s)
  // Brand new that -> just add to array
  // Newly submitted that -> just update the id
  // Existing that -> new fuck -> update fuck counts
  // Existing that -> local fuck -> withdrawal? -> update fuck counts 
  onThatEvents:function(data) {
    // Handle each event
    _.each(data.events, function(e) {
      // Make sure we haven't already handled this event
      var event = App.events.get(e.id);
      if (!event && e.session_id != SessionID) {
        // Add it
        App.events.add(e);
        event = App.events.get(e.id);
        // Get our local that
        var our_that = _.find(App.thats.models, function(t) {
          return t.id == event.get('that_id');
        });
        if (!our_that) {
          // No, but maybe it was just submitted and not yet assigned an id by the server?
          our_that = _.find(App.thats.models, function(t) {
            return t.id == null && t.get('url') == new_that.url;
          });
          if (!our_that) {
            // Nope, this is a brand new that, get it from incoming data and add to local thats
            var new_that = _.find(data.thats, function(t) {
              return t.id == event.get('that_id');
            });
            App.thats.add(new_that);
            our_that = App.thats.get(new_that.id);
          } else {
            // Update it so it gets the server-assigned id
            our_that.set(new_that);
            App.connectThat(our_that);
          }
        }
        // Is this the withdrawal of a fuck?
        if (event.get('withdraw')) {
          // Update the that's fuck count
          our_that.update_fucks(true, Date.parse(event.get('fuck_created_at')));
        } else {
          // Update the that's fuck count
          our_that.update_fucks(false);
        }
        // Update display
        onThatEvent(event, our_that);
      }
    });
  },
  
  // Send logout request to server
  doLogout:function() {
    $.post('/fuckers/logout', '', function(data){
      onFuckerChange(null);
    }, 'JSON');
  },
  
  // Send login request to server
  doLogin:function(data, callback) {
    $.post('/fuckers/authenticate', data, callback, 'JSON').error(function(){
      callback(null);
    });
  },
  
  // Send join request to server
  doJoin:function(data, callback) {
    $.post('/fuckers', data, callback, 'JSON').error(function(){
      callback(null);
    });
  },
  
  // Main routing function
  main:function() {
    // Fetch all templates
    fetch_templates(function() {
    
      // Establish templates
      new HeaderView().set_tpl(TemplateData['HeaderTPL']);
      new ThatsView().set_tpl(TemplateData['ThatsTPL']).set_panel_tpl(TemplateData['ThatsPanelTPL']);
      new ThatView().set_tpl(TemplateData['ThatTPL']);
      new LoginView().set_tpl(TemplateData['LoginTPL']);
      new TopFucksMenuView().set_tpl(TemplateData['TopFucksMenuTPL']);
      
      // Render
      App.renderAll ();
    });

    // Master popup seems to need to display once or it gives incorrect size
    // on first real display, not sure why...
    $('#master_popup').hide().text('x');
  },
});
var App;

// Main function for backbone rendering
function main() {

  // Instantiate application router and start history
  App = new AppRouter();
  Backbone.history.start();

  // Begin
  App.main();
}