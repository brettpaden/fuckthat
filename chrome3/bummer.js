var Bum;
var Port = chrome.extension.connect({ name: 'bummer_facebook' });
var Reauth_El = null;

Port.onMessage.addListener(function(msg) {
  if (msg.status == 'ok') {
    if (msg.type == 'access_token_response') {
      if (msg.access_token) {
	Bum = new Bummer();
	Bum.access_token = msg.access_token;
	console.log("Setting access token to " + msg.access_token);
	facebook_init_complete();
      }
      else if (!window.location.href.match('www.facebook.com/dialog') && !window.location.href.match('www.facebook.com/login')) {
	console.log("No access token, showing auth window");
	do_fb_auth();
      }
    }
    if (msg.type == 'uid_response') {
      // maybe assign a global var here.
      console.log("FBUID is " + msg.id);
    }
    if (msg.type == 'failure') {
      console.log('failure: ' + msg.reason);
    } 
  }
});

$(function() {
    bummer_init();
});

$('body').bind('DOMSubtreeModified', function() {
    if (Bum) {
	Bum.find_links();
    }
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', Google_Analytics_Code]);
_gaq.push(['_trackEvent','Extension','Load']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
    
function bummer_init() {
  console.log("Asking background for access token");
  Port.postMessage({ type: 'access_token_request' });
}

function facebook_init_complete() {
    var data = { 'access_token': Bum.access_token };
    console.log("Facebook init is complete; authenticating");
    $.post(Bummer_Api_Server + '/api/fuckers/fb_authenticate', data, authentication_init_complete);
}

function authentication_init_complete(response) {
    Bum.instance_id = response.instance_id;
    Bum.csrf_token = response.csrf_token;
    Bum.init = true;
    console.log("Authenticated; instance_id: " + Bum.instance_id + " csrf_token: " + Bum.csrf_token);
    if (Reauth_El) {
        el = Reauth_El;
        Reauth_El = null;
	console.log("Since this is a re-auth, we need to bum something");
        bum_it(el);
    } else {
        Bum.find_links();
    }
}

function Bummer(data) {
    this.bums = {};
    if (data) {
	for(i in data) {
	    this[i] = data[i];
	}
    }
    this.instance_id;
    this.init = false;
    this.handling_links = false;
    this.links = {};
    this.link_data = {};
    this.bummed = function(id) {
	console.log("Checking to see if has been bummed: " + id);
	if (this.links[id] && this.links[id]['reference']) {
	    console.log("Since this is a reference link, we are going to return the value for this url instead: " + this.links[id]['true_url'] + " which is " +  this.bums[this.links[id]['true_url']]);
	    return this.bums[this.links[id]['true_url']];
	}
	else {
	    console.log("Returning " + this.bums[id]);
	    return this.bums[id];
	}
    };
    this.addBum = function(id) {
	console.log("Setting as bummed: " + id);
	this.bums[id] = true;
    };
    this.find_links = function() {
	if (!this.init) { return; }
	if (this.handling_links) { return; }
	this.handling_links = true;
	var new_links = {};
	var bum = this;
	$('form.commentable_item').each(function(i, el) {
	    var el_obj = $(el);
	    var data_as_string = el_obj.find('input[name=feedback_params]').attr('value');
	    var data_as_json = $.parseJSON(data_as_string);
	    var id;
	    try {
		id = (data_as_json.target_fbid ? data_as_json.target_fbid : data_as_json.fbid);
	    }
	    catch(err) {
	    }
	    if (id) {
		var parent = 
		    el_obj.find('input[name=timeline_log_data]').attr('value') ? 
		    el_obj.parent().parent() : 
		    window.location.href.match('facebook.com/permalink') ? 
			el_obj.parent().parent().parent().parent() : 
			el_obj.parent();

		data_as_json.body = 
		    parent.find('.messageBody').first().html() || 
		    parent.find('.uiStreamMessage').first().html();
		data_as_json.author = 
		    parent.find('.actorDescription a').first().html();
		data_as_json.link = 
		    sanitize_link(
			parent.find('.shareMediaLink').first().attr('href') || 
			parent.find('a.shareText').first().attr('href')
		    );
		data_as_json.attachments = [];
		parent.find('.uiStreamAttachments a').each(function(q, ael) {
		    if ($(ael).attr('ajaxify') && !$(ael).attr('ajaxify').match(/^\/ajax\//)) {
			data_as_json.attachments.push($(ael).attr('ajaxify'));
		    }
		});
		var cleanse_items = new Array('comment_id','offset','total_comments');
		data_as_json.url = 
		    sanitize_link(
			(
			    el_obj.find('span.uiStreamSource a').first().attr('href') || 
			    el_obj.find('a.uiLinkSubtle').first().attr('href')
			),
			cleanse_items
		    );
		if (data_as_json.url && data_as_json.url.match(/^\//)) {
		    data_as_json.url = 'http://www.facebook.com' + data_as_json.url;
		}
		if (window.location.href.match('facebook.com/permalink')) {
		    data_as_json.url = sanitize_link(window.location.href, cleanse_items);
		}
		if (!el_obj.attr('has_been_bummed')) {
		    if (data_as_json.url) {
			if (data_as_json.link) {
			    new_links[data_as_json.link] = true;
			    console.log('adding a new link - ' + data_as_json.link + ' true url is ' + sanitize_link(data_as_json.url, cleanse_items));
			    bum.links[data_as_json.link] = {
				reference: true,
				true_url: sanitize_link(data_as_json.url, cleanse_items)
			    }
			}
			new_links[data_as_json.url] = true;
			bum.links[data_as_json.url] = { 
			    data: data_as_json,
			    id: id,
			};
			var subel = el_obj.find('.UIActionLinks_bottom');
			var likeel = subel.find('.like_link')
			if (likeel && likeel.length > 0) {
			    $(likeel).after(' &middot; <span class="bummer_' + id + '"></span>');
			} else {
			    $(subel).prepend('<span class="bummer_' + id + '"></span> &middot; ');
			}
		    }
		    el_obj.attr('has_been_bummed', true);
		}
		el_obj.find('div.commentActions').each(function(j, subel) {
		    var comment_as_json = {};
		    for(var i in data_as_json) {
			comment_as_json[i] = data_as_json[i];
		    }
		    var subel_obj = $(subel);
		    if (!subel_obj.attr('has_been_bummed')) {
			var subel_parent = subel_obj.parent();
			comment_as_json.comment_body = subel_parent.find('.commentBody').first().html();
			comment_as_json.comment_author = subel_parent.find('.actorName').html();
			comment_as_json.comment_link = subel_parent.find('a.external').first().attr('href');
			var comment_id = subel_obj.find('button.cmnt_like_link').attr('value');
			if (comment_id && data_as_json.url && data_as_json.url.indexOf('comment_id=')==-1) {
			    comment_as_json.url = data_as_json.url + 
				((data_as_json.url.indexOf('?')==-1)?'?':'&') + 
				'comment_id=' + comment_id;
			    comment_as_json.comment_id = comment_id;
			    id = 'comment_' + comment_id;
			    new_links[comment_as_json.url] = true;
			    bum.links[comment_as_json.url] = {
				data: comment_as_json,
				id: id
			    };
			    $(subel).children().last().after(' &middot; <span class="bummer_' + id + '"></span>');
			}
			subel_obj.attr('has_been_bummed', true)
		    }
		});
	    }
	});
	var urls = new Array();
	for(var i in new_links) {
	    urls.push(i);
	}
	if (urls.length > 0) {
	    var data = { urls: urls }
	    $.ajax(Bummer_Api_Server + '/api/fucks/get_fuckthats', {
		type: 'POST',
		data: data,
		dataType: 'json',
		beforeSend: function(xhr) {
		    xhr.setRequestHeader('Accept', 'application/json');
		},
		headers: { 'X-CSRF-Token': this.csrf_token },
		success: function(data) {
		    bum.mark_links(data);
		},
		error: function(data) {
		    console.log('Unable to fetch bums: ' + data.responseText);
		},
	    });
	}
	else {
	    this.handling_links = false;
	}
    };
    this.mark_links = function(data) {
	for(var i in data) {
	    this.link_data[i] = data[i];
	    if (data[i].my_fuck) {
		if (this.links[i] && this.links[i]['reference']) {
		    this.addBum(this.links[i]['true_url']);
		}
		else {
		    this.addBum(i);
		}
	    }
	}
	for(var i in this.links) {
	    var link = this.links[i];
	    var bummed = this.bummed(i);
	    var bum_html = bummed_text(i);
	    $('.bummer_' + link.id).each(function(i, el) {
		var obj = $(el);
		obj.html(bum_html);
		obj.find('a').attr('data', JSON.stringify(link.data));
		obj.find('a').click(function(ev) {
		    bum_it($(ev.target));
		});
	    });
	}
	this.handling_links = false;
    };
}

function bummed_text(url) {
    var url_link = Bum.link_data[url];
    var link;
    if (
	Bum.links[url] && 
	Bum.links[url]['data'] && 
	Bum.links[url]['data']['link'] && 
	!Bum.links[url]['data']['comment_id']
    ) { 
	link = Bum.link_data[Bum.links[url]['data']['link']];
    }
    var count = link && link.that && link.that.fuck_count ? link.that.fuck_count : 0;
    count += url_link && url_link.that && url_link.that.fuck_count ? url_link.that.fuck_count : 0;
    var bummed = Bum.bummed(url);
    if (bummed) {
	count--;
	return (count == 0 ? 'Bummed' :
	    (count == 1 ? 'Bummed by you and 1 other' : 'Bummed by you and ' + count + ' others'));
    }
    else {
	return (count == 1 ? '1 person was bummed by this &middot; ' : 
	    (count > 1 ? count + ' people were bummed by this &middot; ' : '')) + 
	    '<a href="#" onclick="return false">Bummer</a>';
    }
}

function bum_it(el) {
    var data = $.parseJSON(el.attr('data'));
    var id = (data.comment_id ? 'comment_' + data.comment_id : (data.target_fbid ? data.target_fbid : (data.fbid ? data.fbid : '')));
    var title; 
    if (data.comment_id) {
	title = 
	    (
		data.comment_author ? 
		    data.comment_author + '\'s ' : 
		    ''
	    ) + 
	    'comment' +
	    (
		data.author ? 
		    ' on ' + data.author + '\'s post' :
		    ''
	    ) +
	    (
		data.comment_body ? 
		    ': ' + data.comment_body :
		    ''
	    );
    }
    else {
	title =
	    (
		data.author ? 
		    data.author + '\'s post' :
		    ''
	    ) + 
	    (
		data.author && data.body ? ': ' : ''
	    ) +
	    (
		data.body ? 
		    data.body :
		    ''
	    );
    }
    if (title.length > 200) { 
	title = title.substr(0, 197) + '...';
    }
    Bum.addBum(data.url);
    var params = {
	url: data.url,
	instance_id: Bum.instance_id,
	title: title
    };
    params['body'] = data.body;
    params['author'] = data.author;
    params['author_id'] = data.actor;
    params['link'] = data.link;
    params['attachments'] = data.attachments;
    params['comment_body'] = data.comment_body;
    params['comment_author'] = data.comment_author;
    params['comment_link'] = data.comment_link;
    $.ajax({
	url: Bummer_Api_Server + '/api/fucks/fuckthat',
	type: 'POST',
	data: params,
	headers: {
	    'X-CSRF-Token': Bum.csrf_token
	},
	error: function(req, stat, err) {
	    if (req.responseText == "No current fucker" && !Reauth_El) {
		// Re-attempt authentication
		// it is fragile to rely on the responseText..we should rely on the response code.
		Reauth_El = el;
		do_fb_auth();
	    } else {
		Reauth_El = null;
		log("Unable to bum - params: " + JSON.stringify(params) + " ERROR: " + err + " response: " + req.responseText);
	    }
	},  
	success: function(data, stat, req) {
	      // success!
	      _gaq.push(['_trackEvent', 'Extension', 'Bum', Bum.instance_id]);
	}
    });
    $('.bummer_' + id).each(function(i, el) {
	if (!Bum.link_data[data.url]) {
	    Bum.link_data[data.url] = { that: null };
	}
	if (!Bum.link_data[data.url].that) {
	    Bum.link_data[data.url].that = { url: data.url, fuck_count: 0 }
	}
	Bum.link_data[data.url].that.fuck_count++;
	$(el).html(bummed_text(data.url));
	$(el).attr('bummed', 1);
    });
    console.log("Bummed " + params['url'] + " (" + params['link'] + ")");
}

function rinse(html) {
    if (!html) { return ''; }
    return html.replace(/<.*?>/g, '');
}

function sanitize_link(link, skip_params) {
    if (!link) { return; }
    var parts = link.split('?');
    if (!parts[1]) { return link; }
    var keyvals = parts[1].split('&');
    var pairs = new Array();
    for(var x=0; x<keyvals.length; x++) {
	var pair = keyvals[x].split('=');
	if (skip_params) {
	    var skip_it = false;
	    for(var y=0; y<skip_params.length; y++) {
		if (pair[0] == skip_params[y]) {
		    skip_it = true;
		}
	    }
	    if (skip_it) { continue; }
	}
	pairs.push(pair[0] + '=' + pair[1]);
    }
    return parts[0] + '?' + pairs.sort().join('&');
}
