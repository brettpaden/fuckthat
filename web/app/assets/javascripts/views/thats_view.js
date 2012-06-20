// That view
var ThatView = Backbone.View.extend({
 
  // Init
  initialize:function () {
  },

  // Render a single that  
  render:function (that, count_text, fuck_count_var) {
    $(this.el).html(JST['one_that.html']({ that: that, session_fucker: SessionFucker, count_text: count_text, fuck_count_var: fuck_count_var}));
    return this;
  },

  // Events
  events:{
    "click #fbutton"  : "onFuck",
  },

  // Handle fucks
  onFuck:function(e) {
    var $this = $(e.currentTarget);
    $this.attr('disabled', 'disabled');
    var text = $this.find('#fuckthat_text').text().trim();
    var fuck = (text=='fuckthat');
    var that_id = $this.parents().find('#fuck_that_id').attr('value');
    $('#thats').prepend('<div id="fucked_that_id" style="display:none">'+that_id+'</div>');
    App.onFuck(that_id, fuck);
    return false;
  },
});

// Thats view
var ThatsView = Backbone.View.extend({

  // Init
  initialize:function () {
  },

  // Render all-time panel
  render_all_time:function (thats, count_text, fuck_count_var, mine, when) {
    return this.render_panel($('#all_time_panel'), thats, count_text, fuck_count_var, mine, when);
  },
  
  // Render this-week panel
  render_this_week:function (thats, count_text, fuck_count_var, mine, when) {
    return this.render_panel($('#this_week_panel'), thats, count_text, fuck_count_var, mine, when);
  },
  
  // Render thats panel
  render_panel:function ($panel, thats, count_text, fuck_count_var, mine, when) {
    $panel.html(JST['thats_panel.html']({ thats: thats, session_fucker: SessionFucker, mine: mine, when: when}));
    _.each(thats.models, function(that) {
      var $div = $panel.find('#that_div_'+that.cid);
      $div.html(new ThatView().render(that, count_text, fuck_count_var).el);
      if (typeof(that.hide) != 'undefined' && that.hide) {
        $div.hide();
      } else {
        $div.show();
      }
    });
    if (SessionFucker) {
      $('.that_fuck').show();
    } else {
      $('.that_fuck').hide();
    }
    return this;
  },
  
  // Render thats div
  render:function (thats, no_panel, count_text, fuck_count_var, mine, when) {
    $(this.el).html(JST['thats.html']({ thats: thats, session_fucker: SessionFucker}));
    return this;
  },

  // Events
  events:{
    "click .tabs a"                       : "onTab",
  },

  // Handle 'that' tab 
  onTab:function(e) {
    var $pc = $('.panelContainer');
    var $tp = $('.tabbedPanels');
    $pc.hide().attr('visibility', false);
    $tp.find('.tabs a.active').removeClass('active');
    $(e.currentTarget).attr('class', 'active').blur();
    App.onWhatChange (whatTab());
    $pc.fadeIn(50);
    return false;
  },
});

// Perform thats initialization
function onThatsLoad() {
  // Size thats div to available space on screen
  // this makes things jumpy
  /*
  var headerH = $('#header_div').outerHeight(),
      screenH = $(window).outerHeight();
  $('#content_div').css({
    top: headerH+1,
    height: screenH - headerH
  });
  */
  // Select tab to be displayed
  selectTab(App.what);
  
  // Begin polling server for recent events
//  pollRecentEvents(); 
  
  // Give us a hidden control to manually poll for recent events
  $('#content_div').prepend("<a id='poll' href='' style='display:none'>POLL</a>");
  $('#poll').on('click', function() {
    pollRecentEvents();
    return false;
  });
}

// Determine which tab is active
function whatTab() {
  var $this = $(this);
  var $tp = $('.tabbedPanels');
  return $tp.find('.tabs a.active').text();  
}

// Select tab based on passed 'what'
function selectTab(what) {
  switch(what) {
    default:
    case 'top':
    case 'Most Fucked':
    $e = $('.tabs #top_thats_tab a');
      $('.tabs #top_thats_tab a').click();
      break;
    case 'mine':
    case 'My Fuck Thats':
      $('.tabs #my_thats_tab a').click();
      break;
    case 'month':
    case 'This Month':
      $('.tabs #month_thats_tab a').click();
      break;
    case 'week':
    case 'This Week':
      $('.tabs #week_thats_tab a').click();
      break;
    case 'today':
    case 'Today':
      $('.tabs #today_thats_tab a').click();
      break;
  }
}

// Display or hide 'My Fuck Thats' tab, depending on whether user is logged in
function displayHideMyThats(id) {
  var $pc = $('.panelContainer');
  var $tp = $('.tabbedPanels');
  var $my_thats = $tp.find('#my_thats_tab');
  var $top_thats = $tp.find('#top_thats_tab');
  if (id == null) {
    // Make sure 'My Fuck Thats' is hidden
    $my_thats.hide();
    // If it's active, we need to activate 'Most Fucked' instead
    if ($my_thats.find('a.active').length > 0) {
      $tp.find('a.active').removeClass('active');
      $top_thats.find('a').attr('class', 'active');
    }
  } else {
    // Make sure 'My Fuck Thats' is visible
    $my_thats.show();
  }
}

// Handle change of a 'that', without changing position
function onChangeThat(that) {
  var $pc = $('.panelContainer');
  var that_id = that.cid;
  var $cur_div = $pc.find('#that_div_'+that_id);
  var what = whatTab();
  var count_text = App.countTextFromWhat(what);
  var fuck_count_var = App.fuckCountVarFromWhat(what);
  
  // Make sure it is displayed
  if ($cur_div && $cur_div.length > 0 && $cur_div.is(':visible')) {
    // Do a quick fadeOut and fadeIn
    $cur_div.fadeTo(10, 0.5, function(){
      App.renderThat (that, $cur_div, count_text, fuck_count_var);
      $cur_div.fadeTo(10, 1);
    });
  }
}

// Handle addition of a that to the display
function onAddThat(that) {
  var $pc = $('.panelContainer');
  var that_id = that.cid;
  var $cur_div = $pc.find('#that_div_'+that_id);
  var what = whatTab();
  var count_text = App.countTextFromWhat(what);
  var fuck_count_var = App.fuckCountVarFromWhat(what);
  
  // Do we already have a (hidden) form?
  if (!$cur_div || $cur_div.length == 0) {
    // No, create one
    var div = '<div class="that_div" id="that_div_'+that.cid+'">';
    // Get the next that, we will insert before it
    var next_cid = App.getNextThat(that.cid);
    if (next_cid == '+') {
      $pc.append(div);
    } else {
      var $next_div = $pc.find('#that_div_'+next_cid);
      $next_div.before(div);
    }
    $cur_div = $pc.find('#that_div_'+that_id);
    $cur_div.hide();
  }

  // Re-render
  App.renderThat (that, $cur_div, count_text, fuck_count_var);
  
  // Hide the 'no_thats' display
  $pc.find('.no_thats').fadeOut(100);

  // Reveal 
  $cur_div.slideDown(500);
}

// Handle removal of a that from the display
function onRemoveThat(that) {
  var $pc = $('.panelContainer');
  var that_id = that.cid;
  var $cur_div = $pc.find('#that_div_'+that_id);

  // Remove that from the list
  if ($cur_div && $cur_div.length > 0) {
    $cur_div.slideUp(500, function() {
      // If this was the last item, show the 'no_thats' display
      if ($pc.find('.that_div:visible').length == 0) {
        $pc.find('.no_thats').fadeIn(100);
      }
    });
  } 
}

// Called when a fuck has been successful through the server
function onFuckSuccess(data) {
  // Re-enable disabled control
  id = data.get('that_id');
  that = App.thats.get(id);
  $('#that_div_'+that.cid+' .fbutton').removeAttr('disabled');
  that.disabled = false;
}


