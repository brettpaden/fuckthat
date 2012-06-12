var SessionUser = null;
var AppID = "293971130693272";
var FacebookInit = false;
var InstanceId = null;

function init_facebook(init_function) {
  $('body').append("<div id=fb-root></div><script src='//connect.facebook.net/en_US/all.js' async=true'></script>");
  window.fbAsyncInit = function() {
    FB.init({
      appId:	  AppID,
      channelUrl: '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + '/fb_channel.html',
      status:	  false,
      cookie:	  true,
      xfbml:	  true
    });
    var change_function = function(response) {
      if ($.cookie('FBInit')) {
	var token = (response && response.status == 'connected') ? response.authResponse.accessToken : '';
	var data = { 'access_token': token };
	$.post('/api/fuckers/fb_authenticate', data, function(data) {
	  InstanceId = data.instance_id;
	  SessionUser = new Fucker(data.fucker);
	  if (SessionUser) {
	    $.cookie('FBInit', 1, { expires: 365*50 });
	  }
	  if (init_function) {
	    init_function(data);
	  }
	});
      }
    };
    FB.getLoginStatus();
    FB.Event.subscribe('auth.statusChange', change_function);
    FacebookInit = true;
  };
}
