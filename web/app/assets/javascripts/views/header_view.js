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
