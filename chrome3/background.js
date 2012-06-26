var Bummer_Facebook_Port;
var Current_FBUID;
if (!localStorage.access_token) { localStorage.access_token = {}; }

chrome.extension.onConnect.addListener(function(port) {
    if (port.name == 'bummer_facebook') {
	port.onMessage.addListener(function(msg) {
	    if (msg.type == 'access_token_request') {
		Current_FBUID = msg.id;
		port.postMessage({ 
		    type: 'access_token_response', 
		    access_token: localStorage['access_token_' + Current_FBUID] 
		});
	    }
	});
	Bummer_Facebook_Port = port;
    }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type == 'access_token_response') {
	localStorage['access_token_' + Current_FBUID] = request.access_token;
	if (Bummer_Facebook_Port) {
	    Bummer_Facebook_Port.postMessage(request);
	}
	sendResponse({ status: 'ok' });
    }
});
