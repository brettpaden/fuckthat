$(function() {
    var pairs = $('body').html().split('&');
    var key_values = {};
    for(var x=0; x<pairs.length; x++) {
	var key_val = pairs[x].split('=');
	key_values[key_val[0]] = key_val[1];
    }
    if (key_values['access_token']) {
	chrome.extension.sendRequest(
	    { 
		type: 'access_token_response', 
		access_token: key_values['access_token'],
	    }, 
	    function(response) {
		if (response.status == 'ok') {
		    window.close();
		}
		else {
		    alert('There was a problem: ' + response.status);
		}
	    }
	);
    }
    else {
	alert("Since access was not granted, you will be unable to use the bummer application...bummer.");
    }
});
