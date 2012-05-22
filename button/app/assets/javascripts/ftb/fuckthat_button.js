
var Fucker = null;
var AppID = "293971130693272";  // Facebook-assigned App ID for fthat-dev
var FBGraphAPI = "https://graph.facebook.com/";

$(function() {
  
  // Load facebook Javascript SDK asynchronously,
  // per http://developers.facebook.com/docs/authentication/client-side/
  $('body').prepend("<div id='fb-root'></div><script src='//connect.facebook.net/en_US/all.js' async=true></script>")
  
  // Init the SDK upon load
  window.fbAsyncInit = function() {
    FB.init({
      appId      : AppID,
      channelUrl : '//'+window.location.hostname+'/fb_channel.html', 
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    // listen for and handle auth.statusChange events
    FB.Event.subscribe('auth.statusChange', function(response) {
      if (response.authResponse) {
        // user has auth'd your app and is logged into Facebook
        // Authenticate through server 
        FB.api('/me', function(me){
          if (me.name) {
            alert(me.name);
          }
        })
      } else {
        // user has not auth'd your app, or is not logged into Facebook
      }
    });

    // respond to clicks on the login and logout links
//    document.getElementById('auth-loginlink').addEventListener('click', function(){
//      FB.login();
//    });
//    document.getElementById('auth-logoutlink').addEventListener('click', function(){
//      FB.logout();
//    }); 
  
  // Get hash parameters
  var hParams = hashParams();
  
  // Check if we are responding to a facebook login
  if (hParams['access_token']) {
    alert('got '+hParams['access_token']);
    respondFacebookLogin(hParams['access_token'], hParams['expires_in']);
    return;
  }
  
  // Check for a facebook access token
//  var fb_token = $.cookie('fb_access_token');
//  if (fb_token) {
//    $.post('/api/fuckers/fb_authenticate', { 'access_token': fb_token }, function(data) {
//      alert('ok: '+data.id);
//    }).error(function(data) {
//      alert(data.responseText);
//    });
    // Use this to get current fucker
    //fuckerFromFacebook($.cookie['fb_access_token']);
  }
      
  // Get current fucker
  Fucker = null;
  var fucker_id = $.cookie('fucker_id');
  if (fucker_id) {
    $.getJSON('/api/fuckers/'+fucker_id, function(data) {
      if (data && data.id) {
        Fucker = data;
        // Determine if we've already fucked this
        var fucked = false;
        var content = $('#fuckthat_content').text();
        if (content) {
          // Check with the server
          $.getJSON('/api/fucks/get_fuckthat', {'url': content, 'fucker_id': fucker_id}, function(data) {
            if (data) {
              // Got it, change to "fucked"
              set_fucked();
            } else {
              set_unfucked();
            }
          }).error(function(data) {
            // Assume unfucked
            set_unfucked();
          });
        }
      }
    });
  }
  
  // Set up FuckThat click event
  $('#fuckthat_link').click(function() {
    fuckthat();
    return false;
  });
});

// Get fucker info from facebook access token
function fuckerFromFacebook(fb_token) {
  // Get facebook id
  $.getJSON(FBGraphAPI + 'me', {'access_token': fb_token}, function(data) {
    var fb_id = data.id;
  }).error(function(data) {
  }); 
}

// Break hash parameters into array
function hashParams() {
  var params = {};
  var hashStr = window.location.hash, hashArray, keyVal
  var hashStr = hashStr.substring(1, hashStr.length);
  var hashArray = hashStr.split('&');

  for(var i = 0; i < hashArray.length; i++) {
    var keyVal = hashArray[i].split('=');
    params[unescape(keyVal[0])] = (typeof keyVal[1] != "undefined") ? unescape(keyVal[1]) : keyVal[1];
  }
  return params;
}

// Respond to facebook login
function respondFacebookLogin(access_token, expires_in) {
  // Store access token as cookie
  var today = new Date().valueOf();
  var expires = today + parseInt(expires_in);
  var expires_at = new Date(expires);
  $.cookie('fb_access_token', access_token);
//, {'expires': new Date(new Date().valueOf() + parseInt(expires_in))});
  alert($.cookie('fb_access_token'));
}

// Set button to "fucked"
function set_fucked() {
  $('#fuckthat_link').addClass('fbutton_fucked').removeClass('fuckthat_link');
  $('#fucktxt').html('<b>fuck</b>ed');
}

// Set button to unfucked ("fuckthat")
function set_unfucked() {
  $('#fuckthat_link').addClass('fuckthat_link').removeClass('fbutton_fucked');
  $('#fucktxt').html('<b>fuck</b>that');
}

// Handle facebook login in a popup
function doFacebookLogin() {
  // Display login window, per http://developers.facebook.com/docs/authentication/client-side/#no-jssdk
  var windowW = 1000;
  var windowH = 600;
  var left = screen.width/2-windowW/2;
  var top = screen.height/2-windowH/2;
  var url = "https://www.facebook.com/dialog/oauth?" + 
    "client_id=" + AppID +  
    "&redirect_uri=" + encodeURIComponent("https://www.facebook.com/connect/login_success.html") + 
//    "&scope=COMMA_SEPARATED_LIST_OF_PERMISSION_NAMES" + 
    "&response_type=token";
  var popup = window.open(url, "Facebook Login", "top="+top+",left="+left+",height="+windowH+",width="+windowW+",resizable='no'");
}
                      
// Handle fuckthat button press
function fuckthat() {
  // Get facebook access token
  var fb_token = $.cookie('fb_access_token');
  if (!fb_token) {
    doFacebookLogin();
    return;
  } else {
    alert('token is ' + fb_token);
  }
  return false;

  // Fucking or unfucking?
  var content = $('#fuckthat_content').text();
  var text = $('#fucktxt').text();
  if (text == 'fuckthat') {
    // POST the fuckthat   
    $.post('/api/fucks/fuckthat', {'url': content, 'facebook_id': fb_id}, function(data) {
      // Cool
      set_fucked();
    }).error(function(data) {
      alert(data.responseText);
    });
  } else {
    // DELETE the fuck
    $.ajax('/api/fucks/unfuckthat', { 
      'data': {'url': content, 'facebook_id': fb_id}, 
      'type': 'DELETE',
      success: function(data) {
        // Cool
        set_unfucked();
      },
      error: function(data) {
        alert(data.responseText);
      },
    });
  }
  
  return false;
}

