var Bum;
var Port = chrome.extension.connect({ name: 'bummer_facebook' });
var Current_FBUID;

Port.onMessage.addListener(function(msg) {
    if (msg.type == 'access_token_response') {
	if (msg.access_token) {
	    Bum = new Bummer();
	    Bum.access_token = msg.access_token;
	    facebook_init_complete();
	}
	else if (!window.location.href.match('www.facebook.com/dialog')) {
	    window.open(Bummer_Root_Server + '/pages/init_facebook_access_token', 'fb-auth-popup', config='height=460, width=580, toolbar=no, menubar=0, scrollbars=0, resizable=no, location=no, directories=no, status=no');
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
    
function bummer_init() {
    var profile_link = $('.headerTinymanPhoto').attr('id');
    var parts = profile_link.split('_');
    var id = parts[3];
    if (id) {
	Current_FBUID = id;
	Port.postMessage({ type: 'access_token_request', id: Current_FBUID });
    }
}

function facebook_init_complete() {
    var data = { 'access_token': Bum.access_token };
    $.post(Bummer_Root_Server + '/api/fuckers/fb_authenticate', data, authentication_init_complete);
}

function authentication_init_complete(response) {
    Bum.instance_id = response.instance_id;
    Bum.csrf_token = response.csrf_token;
    Bum.init = true;
    Bum.find_links();
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
	return this.bums[id];
    };
    this.addBum = function(id) {
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
		var parent = el_obj.find('input[name=timeline_log_data]').attr('value') ? el_obj.parent().parent() : el_obj.parent();
		data_as_json.body = 
		    parent.find('.messageBody').first().html() || 
		    parent.find('.uiStreamMessage').first().html();
		data_as_json.author = 
		    parent.find('.actorDescription a').first().html();
		data_as_json.link = 
		    parent.find('.shareMediaLink').first().attr('href') || 
		    parent.find('a.shareText').first().attr('href');
		data_as_json.attachments = [];
		parent.find('.uiStreamAttachments a').each(function(q, ael) {
		    if ($(ael).attr('ajaxify') && !$(ael).attr('ajaxify').match(/^\/ajax\//)) {
			data_as_json.attachments.push($(ael).attr('ajaxify'));
		    }
		});
		data_as_json.url = 
		    el_obj.find('span.uiStreamSource a').first().attr('href') || 
		    el_obj.find('a.uiLinkSubtle').first().attr('href');
		if (data_as_json.url && data_as_json.url.match(/^\//)) {
		    data_as_json.url = 'http://www.facebook.com' + data_as_json.url;
		}
		if (!el_obj.attr('has_been_bummed')) {
		    if (data_as_json.url) {
			new_links[data_as_json.url] = true;
			bum.links[data_as_json.url] = { 
			    data: data_as_json,
			    id: id,
			};
			var subel = el_obj.find('.UIActionLinks_bottom');
			$(subel).prepend('<span class="bummer_' + id + '"></span> &middot; ');
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
			if (comment_id && data_as_json.url) {
			    comment_as_json.url = data_as_json.url + '?comment_id=' + comment_id;
			    comment_as_json.comment_id = comment_id;
			    id = 'comment_' + comment_id;
			    new_links[comment_as_json.url] = true;
			    bum.links[comment_as_json.url] = {
				data: comment_as_json,
				id: id
			    };
			    $(subel).children().last().before('<span class="bummer_' + id + '"></span> &middot; ');
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
	    $.ajax(Bummer_Root_Server + '/api/fucks/get_fuckthats', {
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
		    log('Unable to fetch bums: ' + data.responseText);
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
		this.addBum(i);
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
    var link = Bum.link_data[url];
    var count = link && link.that && link.that.fuck_count ? link.that.fuck_count : 0;
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
	url: Bummer_Root_Server + '/api/fucks/fuckthat',
	type: 'POST',
	data: params,
	headers: {
	    'X-CSRF-Token': Bum.csrf_token
	},
	error: function(req, stat, err) { 
	    log("Unable to bum - params: " + JSON.stringify(params) + " ERROR: " + err + " response: " + req.responseText);
	},
	success: function(data, stat, req) {
	    // success!
	}
    });
    $('.bummer_' + id).each(function(i, el) {
	$(el).html(bummed_text(data.url));
	$(el).attr('bummed', 1);
    });
}

function rinse(html) {
    if (!html) { return ''; }
    return html.replace(/<.*?>/g, '');
}
