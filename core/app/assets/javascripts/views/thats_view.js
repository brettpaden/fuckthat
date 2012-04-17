// That view
var ThatView = Backbone.View.extend({
 
  // Init
  initialize:function () {
  },

  // Set template data
  set_tpl:function(tpl_data) {
    ThatView.template_data = tpl_data;
    return this;
  },

  // Render a single that  
  render:function (that, count_text, fuck_count_var) {
    $(this.el).html(_.template(ThatView.template_data, { that: that, session_fucker: SessionFucker, count_text: count_text, fuck_count_var: fuck_count_var}));
    return this;
  },

  // Events
  events:{
    "click .fuck_button"  : "onFuck",
  },

  // Handle fucks
  onFuck:function(e) {
    var $this = $(e.currentTarget);
    var text = $this.text().trim();
    var fuck = (text=='Fuck That!');
    var that_id = $this.parent().find('#fuck_that_id').attr('value');
    $('#thats').prepend('<div id="fucked_that_id" style="display:none">'+that_id+'</div>');
//    doFuckingPopup($this, !fuck);
    App.onFuck(that_id, fuck);
    return false;
  },
});

// Thats view
var ThatsView = Backbone.View.extend({

  // Init
  initialize:function () {
  },

  // Set template data
  set_tpl:function(tpl_data) {
    ThatsView.template_data = tpl_data;
    return this;
  },
  
  // Set template data for panel
  set_panel_tpl:function(tpl_data) {
    ThatsView.panel_template_data = tpl_data;
    return this;
  },
  
  // Render thats panel
  render_panel:function (thats, count_text, fuck_count_var, mine, when) {
    $('#thats_panel').html(_.template(ThatsView.panel_template_data, { thats: thats, session_fucker: SessionFucker, mine: mine, when: when}));
    _.each(thats.models, function(that) {
      var $div = $('#that_div_'+that.cid);
      $div.html(new ThatView().render(that, count_text, fuck_count_var).el);
      if (typeof(that.hide) != 'undefined' && that.hide) {
        $div.hide();
      } else {
        $div.show();
      }
    });
    return this;
  },
  
  // Render thats div
  render:function (thats, no_panel, count_text, fuck_count_var, mine, when) {
    $(this.el).html(_.template(ThatsView.template_data, { thats: thats, session_fucker: SessionFucker}));
    if (!no_panel) {
      this.render_panel(thats, count_text, fuck_count_var, mine, when);
    } 
    return this;
  },

  // Events
  events:{
    "click .tabs a"                       : "onTab",
//    "mouseover .tabs #top_thats_tab"      : "onTopFucksMouseOver",
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

  // Handle mouseover on tab
  onTopFucksMouseOver:function() {
    doTopFucksMenu();
    return false;
  },
});

// Perform thats initialization
function onThatsLoad() {
  // Size thats div to available space on screen
  var headerH = $('#header_div').outerHeight(),
      screenH = $(window).outerHeight();
  $('#thats_div').css({
    top: headerH+1,
    height: screenH - headerH
  });
  
  // Select tab to be displayed
  selectTab(App.what);
  
  // Begin polling server for recent events
//  pollRecentEvents(); 
  
  // Give us a hidden control to manually poll for recent events
  $('#thats_div').prepend("<a id='poll' href='' style='display:none'>POLL</a>");
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
function changeThat(that) {
  var $pc = $('.panelContainer');
  var that_id = that.cid;
  var $cur_that_form = $pc.find('#edit_that_'+that_id);
  var fadeOutPacifier = true;
  var $mp_div = $('#master_popup');
  var what = whatTab();
  var count_text = App.countTextFromWhat(what);
  var fuck_count_var = App.fuckCountVarFromWhat(what);
  
  // Make sure it is displayed
  if ($cur_that_form && $cur_that_form.length > 0) {
    var $div = $cur_that_form.closest('.that_div');
    // Do a quick fadeOut and fadeIn
    fadeOutPacifier = false;
    $div.fadeTo(10, 0.5, function(){
      App.renderThat (that, $div, count_text, fuck_count_var);
      $div.fadeTo(10, 1, function(){
        $mp_div.fadeOut(250);
      });
    });
  }
  // Fade out pacifier if needed
  if (fadeOutPacifier && $mp_div.attr('class') == 'pacifier_popup') {
    $mp_div.fadeOut(250);
  }
}

// Handle change of fuck count for a that
function onChangeThat(that, insert_id) {
  // No live updates, for now just update the that in place
  changeThat(that);
}

// Get id of next displayed that
function getNextThatId($cur_that_form) {
  $next_that_div = $cur_that_form.closest('.that_div').next();
  if ($next_that_cell.length > 0) {
    id = $next_that_div.find('.edit_that').attr('id');
    return id.substring(10);
  } else {
    return '+';
  }
}

// Do a popup for fuck submission
function doFuckingPopup($button, withdraw) {
  var $mp_div = $('#master_popup');
  var button_pos = $button.offset();
  var buttonW = $button.outerWidth();
  var popupLeft,
      popupTop;
  var scrollTop = $(document).scrollTop();

  popupLeft = button_pos.left + buttonW + 5;
  popupTop = button_pos.top - scrollTop;
  $mp_div.empty().attr('class', 'pacifier_popup');
  if (withdraw) {
    $mp_div.text('Withdrawing your Fuck That, please wait...');
  } else {
    $mp_div.text('Submitting your Fuck That, please wait...');
  }
  $mp_div.unbind('mouseleave');
  $mp_div.css({
    left: popupLeft,
    top: popupTop,
    position: 'absolute'
  });
  $mp_div.hide().fadeIn(100);
}

// Handle removal of a that from the display
function onRemoveThat(that) {
  var $pc = $('.panelContainer');
  var that_id = that.cid;
  var $cur_that_form = $pc.find('#edit_that_'+that_id);
  var fadeOutPacifier = true;
  var $mp_div = $('#master_popup');

  // Remove that from the list
  if ($cur_that_form && $cur_that_form.length > 0) {
    var $div = $cur_that_form.closest('.that_div');
    fadeOutPacifier = false; 
    $div.slideUp(500, function(){
      $div.remove();
      $mp_div.fadeOut(250);
    });
  } 

  // Fade out pacifier if needed
  if (fadeOutPacifier && $mp_div.attr('class') == 'pacifier_popup') {
    $mp_div.fadeOut(250);
  }
}

// Display (already rendered) top fucks menu
function displayTopFucksMenu ($mp_div) {
  var $link = $('.tabs #top_thats_tab a');
  var menuLeft,
      menuTop,
      linkPos = $link.offset(),
      linkW = $link.outerWidth(),
      linkH = $link.outerHeight(),
      menuW = $mp_div.outerWidth(),
      menuH = $mp_div.outerHeight(),
      screenW = $(window).outerWidth(),
      screenH = $(window).outerHeight();
  menuLeft = linkPos.left;
  if (menuLeft + menuW > screenW) {
    menuLeft = screenW - menuW;
  }
  menuTop = linkPos.top;
  if (menuTop < 0) {
    menuTop = 0;
  }
  $mp_div.find('.top_fucks_menu_item').css({ width:linkW }).find('a').css({ width:linkW });
  $mp_div.first('div').css({padding:0,margin:0});
  $mp_div.attr('class', 'top_fucks_menu').css({
    left: menuLeft,
    top: menuTop,
    width: linkW,
    position: 'absolute'
    }).mouseleave(function(){
      $mp_div.fadeOut(100);
  }).fadeIn(50);
}

// Handle popup of Top Fucks menu
function doTopFucksMenu() {
  var $mp_div = $('#master_popup');
  $mp_div.empty();
  $mp_div.html(new TopFucksMenuView().render().el);
  displayTopFucksMenu ($mp_div);
}

// Handle an event by updating thats list as needed
function onThatEvent(event, that) {
  // Just change the that, for now...?
  changeThat(that);
}



