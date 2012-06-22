var Bummer_Facebook_Port;

chrome.extension.onConnect.addListener(function(port) {
    if (port.name == 'bummer_facebook') {
	port.onMessage.addListener(function(msg) {
	    if (msg.type == 'access_token_request') {
		port.postMessage({ 
		    type: 'access_token_response', 
		    access_token: localStorage.access_token 
		});
	    }
	});
	Bummer_Facebook_Port = port;
    }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type == 'access_token_response') {
	localStorage.access_token = request.access_token;
	localStorage.csrf_token = request.csrf_token;
	if (Bummer_Facebook_Port) {
	    Bummer_Facebook_Port.postMessage(request);
	}
	sendResponse({ status: 'ok' });
    }
});
