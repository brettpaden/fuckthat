var FromPluginPage = false;

// Header view
var HeaderView = Backbone.View.extend({

  // Init 
  initialize:function () {
  },

  // Render header view
  render:function () {
    $(this.el).html(JST['header.html']({ session_fucker: SessionFucker }));
    return this;
  },

  // Events associated with header view
  events:{
    'click #fb-login': onFacebookLogin
  },
});

// Perform display changes after fucker change
function displayFuckerChange(fucker_id) {
  // Change whether 'My Fuck Thats' tab is available, based on whether we are logged in
  displayHideMyThats(fucker_id);
  
  // Reload active thats tab  
  var $active_tab = $('.tabbedPanels').find('.tabs a.active').first();
  $active_tab.click();
}

// Perform changes based on fucker change or logout
function onFuckerChange(fucker) {
  // Remove popup
  $('#master_popup').fadeOut(250);

  // Notify router
  App.onFuckerChange();
}

// Handle possible installation of chrome plugin
function handlePlugin() {
  // Is it already installed?
  if ($('#bummer_plugin_installed').length > 0) {
    // Hide button
    $('#chrome_plugin').hide();
  } else {
    // Are we in Chrome?
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
      // Yes, were referred by facebook?
      if (document.referrer && parseUri(document.referrer).host == 'www.facebook.com') {
        // Yes, half the time redirect to page where the download will happen directly
        if (!FromPluginPage && Math.random() < 0.5) {
          FromPluginPage = true;
          $('#chrome_plugin').hide();
          window.location = "#plugin";
          downloadURL('/bummer.crx');
        }
      }
    } else {
      // Show the evil message
      $('#plugin_banner').show();
      $('#chrome_plugin').hide();
    }
  }
}
