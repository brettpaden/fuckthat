var Bummer_Facebook_Ports = new Array();
var Current_FBUID;
var Background_Init = false;
var Next_Port = 0;

chrome.extension.onConnect.addListener(function(port) {
  console.log("Got an incoming connection: " + port.name);
  if (port.name == 'bummer_facebook') {
    port.onMessage.addListener(function(msg) {
      console.log("Got a request from bummer.js: " + msg.type);
      if (msg.type == 'access_token_request') {
	fetch_current_fbuid(function(cookie) {
	  console.log("Returning the access token: " + localStorage['access_token_' + Current_FBUID]);
	  port.postMessage({ 
	    type: 'access_token_response', 
	    status: 'ok',
	    access_token: localStorage['access_token_' + Current_FBUID],
	  });
	});
      }
      if (msg.type == 'uid_request') {
	fetch_current_fbuid(function(cookie) {
	  console.log("Returning the FBUID: " + Current_FBUID);
	  port.postMessage({
	    type: 'uid_response',
	    status: 'ok',
	    id: Current_FBUID
	  });
	});
      }
    });
    port.id = Next_Port++;
    Bummer_Facebook_Ports[port.id] = port;
    port.onDisconnect.addListener(function(p) {
      console.log("port disconnect detected");
      console.log("Disconnecting " + p.id);
      delete Bummer_Facebook_Ports[p.id];
    });
  }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  console.log("we've received a request of type: " + request.type);
  if (Background_Init) {
    console.log("Background is initialized. We will handle the request.");
    if (request.type == 'access_token_response') {
      console.log("Fetching FB uid from cookies");
      fetch_current_fbuid(function(cookie) {
	console.log("Got a UID from the cookie: " + Current_FBUID);
	localStorage['access_token_' + Current_FBUID] = request.access_token;
	console.log("Access token set to " + localStorage['access_token_' + Current_FBUID]);
	if (Bummer_Facebook_Ports.length) {
	  console.log("Since we have an open connection with bummer.js, we will send the message along");
	  for(i in Bummer_Facebook_Ports) {
	    var port = Bummer_Facebook_Ports[i];
	    port.postMessage(request);
	  }
	}
	console.log("Sending an 'ok' status to access.js");
	sendResponse({ status: 'ok' });
      });
    }
  }
  else {
    sendResponse({ status: 'fail', reason: 'Background not ready' });
  }
});

function init_background() {
  if (!localStorage.access_token) { localStorage.access_token = {}; }
  if (!localStorage['first_run']) { 
    console.log("First run, showing popup");
    do_fb_auth();
    localStorage['first_run'] = true;
    Background_Init = true;
  }
  else {
    console.log("Not first run, no popup - however we do need to get the uid");
    fetch_current_fbuid(function() {
      Background_Init = true;
    });
  }
}

function fetch_current_fbuid(callback) {
  chrome.cookies.get({ url: 'http://facebook.com/', name: 'c_user' }, function(cookie) {
    if (cookie) {
      Current_FBUID = cookie.value;
    }
    else {
      console.log("Unable to fetch a cookie wtf");
    }
    callback(cookie)
  });
};
init_background();
