var SessionFucker = null;   // Current fucker
var AppID = "293971130693272";  // Facebook-assigned App ID for fthat-dev
var InitTimeout = null;     // Timeout handler for initialization
var FacebookInit = false;      // Whether facebook was initialized
var LoadingTimeout = null;  // Timeout handler for loading pacifier
var LoadingCount = 0;       // Count for loading pacifier
var InstanceID = null;      // Current instance id

var AppRouter = Backbone.Router.extend({
  routes:{
    "":"main",
    "top":"top",
    "mine":"mine",
    "month":"month",
    "week":"week",
    "today":"today",
    "button":"button"
  },

  // Current display
  what: 'top', 
  for_button: false,
  
  // Collections
  thats:null,
  fucks:null,
  fuckers:null,
  events:null,
  
  initialize:function () {
    this.thats = new Thats();
    this.fucks = new Fucks();
    this.fuckers = new Fuckers();
    this.events = new Events();
  },
  top:function() {
    // Switch to top tab if already displayed, otherwise render whole page
    var $top_tab = $('#top_thats_tab a');
    if ($top_tab.length > 0) {
      $top_tab.click();
    } else {
      App.what = 'top';
      this.main();
    }
  },
  mine:function() {
    // Switch to "my" tab if already displayed, otherwise render whole page
    var $my_tab = $('#my_thats_tab a');
    if ($my_tab.length > 0) {
      $my_tab.click();
    } else {
      App.what = 'mine';
      this.main();
    }
  },
  month:function() {
    // Switch to this month's top if already displayed, otherwise render whole page
    var $month_tab = $('#month_thats_tab a');
    if ($month_tab.length > 0) {
      $month_tab.click();
    } else {
      App.what = 'month';
      this.main();
    }
  },
  week:function() {
    // Switch to this week's top if already displayed, otherwise render whole page
    var $week_tab = $('#week_thats_tab a');
    if ($week_tab.length > 0) {
      $week_tab.click();
    } else {
      App.what = 'week';
      this.main();
    }
  },
  today:function() {
    // Switch to today's if already displayed, otherwise render whole page
    var $today_tab = $('#today_thats_tab a');
    if ($today_tab.length > 0) {
      $today_tab.click();
    } else {
      App.what = 'today';
      this.main();
    }
  },
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
  onFuckerChange:function() {
    App.what = 'top';
    this.renderAll();
  },
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
  renderHeader:function() {
    if (!App.headerView) {
      App.headerView = new HeaderView();
    }
    $('#header_div').html(App.headerView.render().el);
  },
  button:function() {
    if (!App.headerView) {
      App.renderHeader();
    }
    if (!App.buttonView) {
      App.buttonView = new ButtonView();
    }
    App.buttonView.render();
  },
  renderAll:function() {

    // Fetch all displayed data
    $.getJSON('/api/thats/data', function(data){

      // Populate our collections
      App.thats.reset();
      App.thats.add (data.thats);
      _.each(App.thats, function(t) { App.extractfuckCounts(t, data); });
      App.fucks.reset();
      App.fucks.add (data.fucks);
      App.fuckers.reset();
      App.fuckers.add (data.fuckers);
      App.events.reset()
      App.events.add (data.events);

      // Establish current fucker and session id
      if (data.fucker_id) {
//        SessionFucker = App.fuckers.get(data.fucker_id);
      } else {
        SessionFucker = null;
        if (App.what == 'mine' || App.what == 'My Fuck Thats') {
          App.what = 'top';
        }
      }
      
      // Render header
      App.renderHeader (false, false);
      
      // Connect that objects to other objects
      App.connectThats (App.thats.models, data);
      
      // Connect fuck objects to other objects
      App.connectFucks (App.fucks.models);
      
      // Render thats
      App.renderThats (true, null, null, App.what == 'mine' || App.what == 'My Fuck Thats', 
        App.whenFromWhat(whatTab()));
      
      // Initialize 
      onThatsLoad ();

      // Render facebook login button,
      // per http://developers.facebook.com/docs/reference/javascript/FB.XFBML.parse/      
      if (typeof(FB) != 'undefined') {
        FB.XFBML.parse();   
      }
      
      // Cancel loading pacifier 
      clearTimeout(LoadingTimeout);
      LoadingTimeout = null;
    }).error(function(data) {
      alert("Something went wrong: "+data.responseText)
    });
  },
  
  // Connect a single fuck to other objects
  connectFuck:function(fuck) {
    fuck.that = App.thats.get(fuck.get('that_id'));
  },
  
  // Connect fucks to other objects
  connectFucks:function(fucks) {
    _.each(fucks, function(fuck) {
      App.connectFuck(fuck);
    });
  },
  
  // Extract a that's fuck counts from info passed in
  extractFuckCounts:function(that, data) {
    that.month_fuck_count = data.month_fuck_counts[that.id];
    that.week_fuck_count = data.week_fuck_counts[that.id];
    that.day_fuck_count = data.day_fuck_counts[that.id];
    that.time_collected = Date.parse(data.time);
  },
  
  // Connect a single that to other objects
  connectThat:function(that, data) {
    // Connect to my fuck, if any
    if (SessionFucker) {
      that.my_fuck = _.find (App.fucks.models, function(fuck){
        return fuck.get('that_id') == that.id && fuck.get('fucker_id') == SessionFucker.id;
      }) || null;
    } else {
      that.my_fuck = null;
    }
    // Extract weekly, monthly, daily fuck counts
    App.extractFuckCounts(that, data);
  },
  
  // Connect thats to other objects
  connectThats:function(thats, data) {
    _.each(thats, function(that) {
      App.connectThat(that, data);
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
    $x = new ThatsView().render(App.thats, no_panel, count_text, fuck_count_var, mine, when);
    $('#content_div').html($x.el);
    App.thats.showAllThats();
    App.thats.sortByFucks();
    App.thats.showTopN(25);
    $x.render_all_time(App.thats,
      App.countTextFromWhat('top'), 
      App.fuckCountVarFromWhat('top'), 
      false, 
      App.whenFromWhat('top')
    );
    App.thats.sortByWeekFucks();
    App.thats.showTopN(25);
    $x.render_this_week(App.thats,
      App.countTextFromWhat('week'),
      App.fuckCountVarFromWhat('week'),
      false,
      App.whenFromWhat('week')
    );
    $('#content_div').html($x.el);
  },
  
  // Render thats panel
  renderThatsPanel:function(count_text, fuck_count_var, mine, when) {
    new ThatsView().render_panel(App.thats, count_text, fuck_count_var, mine, when);
  },

  // Get the that in the collection following the passed that
  // Returns the cid of the next that, or '+' if the that is the last one, -1 if the that isn't found at all
  getNextThat:function(cid) {
    var len = App.thats.models.length;
    var next_id = -1;
    for (var i = 0; i < len; i++) {
      var that = App.thats.models[i];
      if (that.cid == cid) {
        if (i < len-1) {
          next_id = App.thats.models[i+1].cid;
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
    var dontChange = false;
    // Search for the that and get its real id
    var that = App.thats.getByCid(cid);
    // Find existing fuck, if any
    var that_id = that.id;
    var fucker_id = SessionFucker.id;
    var my_fuck = _.find(App.fucks.models, function(fuck) { 
      return fuck.get('that_id') == that_id && fuck.get('fucker_id') == fucker_id; 
    });
    // Update that's fuck count (this is done independently on the server), and re-sort
    that.update_fucks(my_fuck ? true : false, my_fuck ? Date.parse(my_fuck.get('created_at')) : null);
    // Disable changes to the 'that' until server returns success
    that.disabled = true;
    // Resort
    App.thats.sort();
    // Perform the fuck action
    if (!my_fuck && fuck) {
      // Creating a new fuck
      that.my_fuck = App.fucks.create({
          that_id: that_id, 
          fucker_id: fucker_id, 
          instance_id: InstanceID
        }, {
          success: onFuckSuccess, 
          error: onError, 
          headers: {'X-CSRF-Token': $.cookie('CSRF-Token')}, 
        }
      );
    } else if (my_fuck && !fuck) {
      // Withdrawing a fuck
      my_fuck.instance_id = InstanceID;
      my_fuck.destroy({
        success: onFuckSuccess,
        error: onError,
        headers: {'X-CSRF-Token': $.cookie('CSRF-Token')}, 
        data: 'instance_id='+InstanceID
      });
      that.my_fuck = null;
      // Remove from display, if displaying my thats
      if (App.what == 'mine' || App.what == 'My Fuck Thats') {
        onRemoveThat(that);
        dontChange = true;
      }
    } else {
      // Shouldn't happen, withdrawing non-existing fuck
    }
    // Update the that in our display
    if (!dontChange) {
      onChangeThat(that);
    }
  },
  
  // Update local fucks collection with any new incoming data
  updateFucks:function(data) {
    _.each(data.fucks, function(f) {
      // Do we already have this fuck?
      var our_fuck = App.fucks.get(f.id);
      if (!our_fuck) {
        // No, maybe it was just submitted and not yet assigned an id by the server?
        our_fuck = _.find(App.fucks.models, function(ff) {
          return ff.id == null && ff.get('that_id') == f.that_id && ff.get('fucker_id') == f.fucker_id;
        });
        if (!our_fuck) {
          // Nope, add to local fucks
          App.fucks.add(f);
          our_fuck = App.fucks.get(f.id);
        }
      }
      // Update attributes
      our_fuck.set(f);
      App.connectFuck(our_fuck);
    });
  },
  
  // Update local thats collection with any new incoming data
  updateThats:function(data) {
    _.each(data.thats, function(t) {
      // Do we already have this that?
      var our_that = App.thats.get(t.id);
      if (!our_that) {
        // No, maybe it was just submitted and not yet assigned an id by the server?
        our_that = _.find(App.thats.models, function(tt) {
          return tt.id == null && tt.get('url') == t.url;
        });
        if (!our_that) {
          // Nope, add to local thats
          App.thats.add(t);
          our_that = App.thats.get(t.id);
        }
      }
      // Update attributes
      our_that.set(t);
      App.connectThat(our_that, data);
    });
    // Resort
    App.thats.sort();
  },
  
  // Process new event
  processEvent:function(event) {
    var our_that = App.thats.get(event.get('that_id'));

    // If withdrawing our own fuck, remove it
    if (event.get('fucker_id') == SessionFucker.id && event.get('withdraw')) {
      var our_fuck = App.fucks.get(event.get('fuck_id'));
      if (our_fuck) {
        App.fucks.remove(our_fuck);
        our_that.my_fuck = null;
      }
    }
    
    // If displaying my fucks, and this event concerns one of them...
    if (event.get('fucker_id') == SessionFucker.id &&
        (App.what == 'mine' || App.what == 'My Fuck Thats')) {
      // If withdrawing...
      if (event.get('withdraw')) {
        // Remove from display
        onRemoveThat(our_that);
      } else {
        // Add to display
        onAddThat(our_that);
      }
    } else {
      // Just update
      onChangeThat(our_that);
    }
  },
  
  // Respond to new event(s)
  onThatEvents:function(data) {
    // Update fucks and thats with incoming data
    App.updateFucks(data);
    App.updateThats(data);

    // Handle each event
    _.each(data.events, function(e) {
      // Make sure we haven't already handled this event
      if (!App.events.get(e.id)) {
        // Add it
        App.events.add(e);
        event = App.events.get(e.id);
        // Only process it if did not originate from this instance
        if (e.instance_id != InstanceID) {
          App.processEvent(event);
        }
      }
    });
  },
  
  // Main routing function
  main:function() {
    new HeaderView();
    new ThatsView();
    new ThatView();
    
    App.renderAll();
  },
});
var App;

function appInit() {
  // Instantiate application router and start history
  if (!App) {
    App = new AppRouter();
    Backbone.history.start();
  }
}

// Handle response to facebook authentication against server
function onFacebookAuth(onInit) {
  if (onInit) {
    appInit();
  } else if(App) {
    App.onFuckerChange();
  }
}

// Response to facebook login request
function onFacebookLogin() {
  if (FB) {
    // Check if we are already logged in...
    FB.getLoginStatus(function(response) {
      if (response.status == 'connected') {
        // Process the login without doing actual facebook login
        onFacebookLoginChange(response, false);
      }
    });
  }
}

// Handle login of facebook user, either on init or later
function onFacebookLoginChange(response, onInit) {
  // Authenticate (or reset session) depending on whether facebook user is logged in
  SessionFucker = null; // By default, unless we specifically authenticate
  var token = (response && response.status == 'connected') ? response.authResponse.accessToken : '';
  var data = (token || onInit)  ? {'access_token': token} : null; 
  $.post('/api/fuckers/fb_authenticate', data, function(data) {
    // Set current fucker
    InstanceID = data.instance_id;
//    SessionFucker = new Fucker(data.fucker);
    if (SessionFucker) {
      $.cookie('FBInit', 1, {expires: 365*50});  
    }
    onFacebookAuth(onInit);
  }).error(function(data) {
    var err = "Facebook authentication failed: "+data.responseText;
    console.log(err);
    onFacebookAuth(onInit);
  });
}

// On initialization timeout
function onInitTimeout() {
  alert("We're sorry, we were unable to log you in because we can not contact the Facebook server. Please refresh your browser at any time to try again.");
  // Force rendering without facebook authentication
  onFacebookLoginChange(null, true);
}

// Loading pacifier
function updateLoading() {
  LoadingCount++;
  var dotCount = LoadingCount % 20;
  var dotText = FacebookInit ? "Loading" : "Connecting with Facebook";
  dotText += Array(dotCount+1).join('.'); // What a dirty way to do this!
  $('#loading').text(dotText);
  LoadingTimeout = setTimeout(updateLoading, 100);
}

// Called in response to an error on a fuck
function onError(model, response) {
  alert('Oops, something went wrong.\n\n'+response.responseText+'\n\nPress OK to reload FuckThat.');
  location.reload();
}

// Main function for backbone rendering
function main() {
  // Begin pacifier
  setTimeout(updateLoading, 100);
  
  FacebookInit = true;
  appInit();
  return;
  
  // Load facebook Javascript SDK asynchronously,
  // per http://developers.facebook.com/docs/authentication/client-side/
  $('body').append("<div id='fb-root'></div><script src='//connect.facebook.net/en_US/all.js' async='true'></script>")
  
  // Init the SDK upon load
  window.fbAsyncInit = function() {
    FB.init({
      appId      : AppID, // Our APP Id
      channelUrl : '//'+window.location.hostname+'/fb_channel.html', // Channel file
      status     : false, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true,  // parse XFBML
    });

    FB.getLoginStatus(function(response) {
      // Handle login status change
      if ($.cookie('FBInit')) {
        onFacebookLoginChange(response, true);
      } else {
        onFacebookLoginChange(null, true);
      }
    });
    
    // Listen for and handle auth.statusChange events
    FB.Event.subscribe('auth.statusChange', function(response) {
      if ($.cookie('FBInit')) {
        onFacebookLoginChange(response, false);
      } else {
        onFacebookLoginChange(null, false);
      }
    });
    
    // Facebook initialized
    clearTimeout(InitTimeout);
    FacebookInit = true;
  };

  // Set timeout for facebook initialization
  InitTimeout = setTimeout(onInitTimeout, 10000);
  
  // Set up window resize event
/*
 * commenting this out because it causes weird flickering
 * and if you're looking at anything other than 'top' and switch windows,
 * when you come back, it flickers then goes to top again
 *
 * $(window).resize (function() {
    App && App.renderAll();
  });
  */
}
