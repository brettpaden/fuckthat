var max_repeat = 10;
var current_find_iteration = 0;
var button_url = 'http://d1.pkt3.com:10071'
var button_route = '';
var found_iframes = new Object;

window.onload = function ()
{
  find_facebook_like_frames();
}

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
    setTimeout(find_facebook_like_frames, 100);
  }
}

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};
  
function fuck_that_parent(iframe) {
  var fucker = document.createElement('iframe');
	for (i in iframe) {
		fucker.style[i] = iframe.style[i];
	}
  fucker.float = true;
	fucker.frameBorder = 0;
	fucker.scrolling = 'no';
	fucker.align = iframe.align;
	fucker.marginHeight = iframe.marginHeight;
	fucker.marginWidth = iframe.marginWidth;
  var content = parseUri(iframe.src).queryKey.href;
  var title = encodeURIComponent(document.title);
//  var query = iframe.src.match(/\?.*/) || iframe.src.match(/\#\ .*/);
  fucker.src = button_url + button_route + '?content='+content+'&title='+title;
	//console.log("------------------------------------------------------------------------");
    //console.log(fucker.src);
	//console.log("------------------------------------------------------------------------");
  iframe.parentNode.insertBefore(fucker, iframe.nextSibling);
}
