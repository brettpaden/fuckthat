
var Fucker = null;              // Current fucker
var AppID = "293971130693272";  // Facebook-assigned App ID for fthat-dev
var Inited = false;             // Whether facebook login is initialized
var InstanceID = null;          // Instance ID

$(function() {
  
  // Set up FuckThat click event
  $('#fuckthat_link').click(function() {
    fuckthat(false);
    return false;
  });

  // Load facebook Javascript SDK asynchronously,
  // per http://developers.facebook.com/docs/authentication/client-side/
  $('body').prepend("<div id='fb-root'></div><script src='//connect.facebook.net/en_US/all.js' async=true></script>")
  
  // Init the SDK upon load
  window.fbAsyncInit = function() {
    FB.init({
      appId      : AppID, // Our APP Id
      channelUrl : '//'+window.location.hostname+'/fb_channel.html', // Channel file
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    // Listen for and handle auth.statusChange events
    FB.Event.subscribe('auth.statusChange', function(response) {
      if (response.authResponse) {
        // User has auth'd the app and is logged into Facebook
        // Now we have an access token, we authenticate this through the server
        loginServer(response, false);
      }
    });
    Inited = true;
  };
  
  // Reset button based on current fucker
  resetButton();
});

// Precipitate a login at the fuckthat server, now that we have a logged in facebook user
function loginServer(response, do_fuckthat) {
  Fucker = null; // By default, unless we specifically authenticate
  var token = (response.status == 'connected') ? response.authResponse.accessToken : '';
  var data = (token || !do_fuckthat)  ? {'access_token': token} : null; 
  $.post('/api/fuckers/fb_authenticate', data, function(data) {
    // Set instance id and current fucker
    InstanceID = data.instance_id;
    Fucker = data.fucker;
    resetButton();
    // Do fuckthat action if we were waiting for the login
    if (do_fuckthat) {
      fuckthat(true);
    }
  }).error(function(data) {
    resetButton();
  });
}

// Reset button based on current fucker and whether has fucked that
function resetButton() {
  // If we have a fucker, determine if we've already fucked this
  var content = $('#fuckthat_content').text();
  if (Fucker && content) {
    // Check with the server
    $.getJSON('/api/fucks/get_fuckthat', {url: content}, function(data) {
      if (data) {
        // Got it, change to "fucked"
        set_fucked();
      } else {
        set_unfucked();
      }
    }).error(function(data) {
      set_unfucked();
    });
  } else {
    set_unfucked();
  }
}

// Set button to "fucked"
function set_fucked() {
  $('#fuckthat_link').addClass('fbutton_fucked').removeClass('fuckthat_link');
  $('#fucktxt').html('un<b>fuck</b>');
}

// Set button to unfucked ("fuckthat")
function set_unfucked() {
  $('#fuckthat_link').addClass('fuckthat_link').removeClass('fbutton_fucked');
  $('#fucktxt').html('<b>fuck</b>that');
}

// Do facebook login
function doFacebookLogin() {
  FB.login(function(response) {
    if (response.authResponse) {
      // Login to fuckthat server and attempt the fuckthat again
      loginServer(response, true);
    }
  });
}

// Handle fuckthat button press
function fuckthat(fromLogin) {
  // Can't do anything until we're done with our initialization
  if (!Inited) {
    alert('FuckThat button is not yet initialized, please try again');
    return false;
  }
  
  // If no current fucker, do facebook login
  if (!Fucker) {
    doFacebookLogin();
    return false;
  }

  // Fucking or unfucking?
  var content = $('#fuckthat_content').text();
  var title = $('#fuckthat_title').text();
  var text = $('#fucktxt').text();
  if (text == 'fuckthat') {
    // POST the fuckthat
    $.ajax('/api/fucks/fuckthat', {
      data: {url: content, title: title, instance_id: InstanceID},
      type: 'POST',
      dataType: 'json',
      headers: {'X-CSRF-Token': $.cookie('CSRF-Token')}, 
      success: function(data) {
        set_fucked();
      },
      error: function(data) {
        alert('Something went wrong, please try again.\n\n'+data.responseText);
        if (data.responseText.search('has already fucked that') != -1) {
          set_fucked();
        }
      },
    });
  } else {
    // If we are getting this after a forced facebook login, that means the user hit "fuckthat" when
    // they have already fucked that, we don't want to misinterpret this as an unfuck, so don't do anything
    if (!fromLogin) {
      // DELETE the fuck
      $.ajax('/api/fucks/unfuckthat', { 
        data: {'url': content, instance_id: InstanceID}, 
        type: 'DELETE',
        dataType: 'json',
        headers: {'X-CSRF-Token': $.cookie('CSRF-Token')}, 
        success: function(data) {
          // Cool
          set_unfucked();
        },
        error: function(data) {
          alert('Something went wrong, please try again.\n\n'+data.responseText);
          if (data.responseText.search('hasn\'t fucked that') != -1) {
            set_unfucked();
          }
        },
      });
    }
  }
  
  return false;
}

