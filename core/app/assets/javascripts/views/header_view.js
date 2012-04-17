// Header view
var HeaderView = Backbone.View.extend({

  // Init 
  initialize:function () {
  },

  // Set template data
  set_tpl:function(tpl_data) {
    HeaderView.template_data = tpl_data;
    return this;
  },
  
  // Render header view
  render:function () {
    $(this.el).html(_.template(HeaderView.template_data, { session_fucker: SessionFucker}));
    return this;
  },

  // Events associated with header view
  events:{
    "click #logout"         : "onLogout",
    "click #login"          : "onLoginPopup",
    "click #join"           : "onJoinPopup",
  },

  // Perform logout
  onLogout:function() {
    // Send logout request to server
    App.doLogout();
    return false;
  },

  // Display login popup
  onLoginPopup:function() {
    doLoginPopup(onLogin, true);
    return false;
  },

  // Display join popup
   onJoinPopup:function() {
    doLoginPopup(onJoin, false);
    return false;
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

// Display (already rendered) login popup dialog
function  displayLoginPopup ($mp_div, submit_fn) {
  var $link = $('#header_login');
  var dlgLeft,
      dlgTop,
      linkPos = $link.offset(),
      linkW = $link.outerWidth(),
      linkH = $link.outerHeight(),
      dlgW = $mp_div.outerWidth(),
      dlgH = $mp_div.outerHeight();
  dlgLeft = linkPos.left + linkW - dlgW;
  if (dlgLeft < 0) {
    dlgLeft = 0;
  }
  dlgTop = linkPos.top + linkH + 1;
  if (dlgTop < 0) {
    dlgTop = 0;
  }
  $mp_div.find('.new_fucker').submit(submit_fn);
  $mp_div.attr('class', 'login_popup').css({
    left: dlgLeft,
    top: dlgTop,
    position: 'absolute'
    }).mouseleave(function(){
      $mp_div.fadeOut(100);
  }).fadeIn(250);
  $mp_div.find('.fucker_field').first().focus();
}

// Do login popup dialog
function doLoginPopup(submit_fn, is_login) {
  var $mp_div = $('#master_popup');
  $mp_div.empty();
  $mp_div.html(new LoginView().render(is_login).el);
  displayLoginPopup ($mp_div, submit_fn);
}

// Handle login error
function loginError(msg) {
  var html = 'You must be fucking around!<br/>'+msg+'<br/>Try again, fucker.'
  var $mp_div = $('#master_popup');
  if ($mp_div.find('.login_error').length == 0) {
    $mp_div.prepend('<div class="login_error"></div>');
    $mp_div.find('.login_error').hide().html(html).slideDown(250);
  } else {
    $mp_div.find('.login_error').fadeOut(100).html(html).fadeIn(100).fadeTo(100,0.4).fadeTo(200,1);
  }
}

// Process login error
function processLoginError(data) {
  if (data && data['name']) {
    loginError('Name '+data['name'][0]+'.');
  } else if (data && data['password']) {
    loginError('Password '+data['password'][0]+'.');
  } else {
    loginError('Unknown server error occurred.');
  }
}

// Handle login response
function loginResponse(data) {
  if (data && typeof(data['id']) != 'undefined') {
    onFuckerChange(data);
  } else {
    processLoginError(data);
  }
}

// Handle login
function onLogin() {
  // Send login request to server
  var data = { fucker: {
      name: $('#fucker_name').attr('value'),
      password: $('#fucker_password').attr('value')
  }}; 
  App.doLogin(data, loginResponse);
  return false;
}

// Handle join
function onJoin() {
  var name = $('#fucker_name').attr('value');
  var pwd = $('#fucker_password').attr('value');
  var confirm = $('#confirm').attr('value');

  // Make sure there is a password
  if (pwd.trim().length == 0) {
    loginError('You must supply a password.');
  // Make sure password matches confirm, before we even send to the server
  } else if (pwd != confirm) {
    loginError('Your password doesn\'t match your confirmation.');
  } else {
    // Send login request to server
    var data = { confirm: confirm,
      fucker: {
        name: name,
        password: pwd,
      }
    };
    App.doJoin(data, loginResponse);   
  }
  return false;
}
