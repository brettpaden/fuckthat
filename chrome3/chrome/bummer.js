var Bum;
var Bummer_Root_Server = 'http://d1.pkt3.com:10050';
var Authenticated_Status = false;
var Access_Token;
var CSRF_Token;

var Port = chrome.extension.connect({ name: 'bummer_facebook' });
Port.onMessage.addListener(function(msg) {
    if (msg.type == 'access_token_response') {
	if (msg.access_token) {
	    Access_Token = msg.access_token;
	    // WRITEME fetch from server here in a later version
	    if (localStorage.bummer) {
		Bum = new Bummer(JSON.parse(localStorage.bummer));
	    }
	    if (!Bum) {
		Bum = new Bummer();
		localStorage.bummer = JSON.stringify(Bum);
	    }
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
    Port.postMessage({ type: 'access_token_request' });
}

function facebook_init_complete(response) {
    var data = { 'access_token': Access_Token };
    $.post(Bummer_Root_Server + '/api/fuckers/fb_authenticate', data, bummer_init_complete);
}

function bummer_init_complete(response) {
    Bum.instance_id = response.instance_id;
    CSRF_Token = response.csrf_token;
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
    this.finding_links = false;
    this.bummed = function(id) {
	return this.bums[id];
    };
    this.addBum = function(id) {
	this.bums[id] = true;
    };
    this.removeBum = function(id) {
	if (!this.bums[id]) { return; }
	delete this.bums[id];	
    };
    this.find_links = function() {
	if (!this.init) { return; }
	if (this.finding_links) { return; }
	this.finding_links = true;
	$('form.commentable_item').each(function(i, el) {
	    if (!$(el).attr('has_been_bummed')) {
		var data_as_string = $(el).find('input[name=feedback_params]').attr('value');
		var data_as_json = $.parseJSON(data_as_string);
		var id;
		try {
		    id = (data_as_json.target_fbid ? data_as_json.target_fbid : data_as_json.fbid);
		}
		catch(err) {
		}
		if (id) {
		    data_as_json.body = 
			rinse($(el).parent().find('.messageBody').first().html()) || 
			rinse($(el).parent().find('.uiStreamMessage').first().html());
		    data_as_json.author = 
			rinse($(el).parent().find('.actorDescription a').first().html());
		    data_as_json.link = 
			rinse($(el).parent().find('.shareMediaLink').first().attr('href')) || 
			rinse($(el).parent().find('a.shareText').first().attr('href'));
		    data_as_json.attachments = [];
		    $(el).parent().find('.uiStreamAttachments a').each(function(q, ael) {
			if ($(ael).attr('ajaxify') && !$(ael).attr('ajaxify').match(/^\/ajax\//)) {
			    data_as_json.attachments.push(rinse($(ael).attr('ajaxify')));
			}
		    });
		    data_as_json.url = rinse($(el).find('span.uiStreamSource a').first().attr('href') || $(el).find('a.uiLinkSubtle').first().attr('href'));
		    if (data_as_json.url && data_as_json.url.match(/^\//)) {
			data_as_json.url = 'http://www.facebook.com' + data_as_json.url;
		    }
		    $(el).find('.UIActionLinks_bottom').each(function(j, subel) {
			var bummed = Bum.bummed(id);
			var bum_html = bummed ? 'Bummed' : 
			    '<a href="#" onclick="return false;">Bummer</a>';
			bum_html = 
			    '<span class="bummer_' + id + '">' + 
				bum_html + 
			    '</span>';
			$(subel).prepend(bum_html + ' &middot; ');
			$(el).find('.bummer_' + id + ' a').attr('data', JSON.stringify(data_as_json));
			$(el).find('.bummer_' + id + ' a').click(function(ev) {
			    var tel = $(ev.target);
			    bum_it(tel);
			});
		    });
		    $(el).find('div.commentActions').each(function(j, subel) {
			data_as_json.url = rinse($(subel).find('a.uiLinkSubtle').first().attr('href'));
			data_as_json.comment_body = rinse($(subel).parent().find('.commentBody').first().html());
			data_as_json.comment_author = rinse($(subel).parent().find('.actorName').html());
			data_as_json.comment_link = rinse($(subel).parent().find('a.external').first().attr('href'));
			if (data_as_json.url.match(/^\//)) {
			    data_as_json.url = 'http://www.facebook.com' + data_as_json.url;
			}
			var comment_id = $(subel).find('button.cmnt_like_link').attr('value');
			if (comment_id) {
			    data_as_json.comment_id = comment_id;
			    id = 'comment_' + comment_id;
			    var bummed = Bum.bummed(id);
			    var bum_html = bummed ? 'Bummed' : 
				'<a href="#" onclick="return false;">Bummer</a>';
			    bum_html = 
				'<span class="bummer_' + id + '">' + 
				    bum_html + 
				'</span>';
			    $(subel).children().last().before(bum_html + ' &middot; ');
			    $(el).find('.bummer_' + id + ' a').attr('data', JSON.stringify(data_as_json));
			    $(el).find('.bummer_' + id + ' a').click(function(ev) {
				var tel = $(ev.target);
				bum_it(tel);
			    });
			}
		    });
		}
		$(el).attr('has_been_bummed', true);
	    }
	});
	Bum.finding_links = false;
    };
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
		data.body ? 
		    ': ' + data.body :
		    ''
	    );
    }
    if (title.length > 200) { 
	title = title.substr(0, 197) + '...';
    }
    Bum.addBum(id);
    localStorage.bummer = JSON.stringify(Bum);
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
	    'X-CSRF-Token': CSRF_Token
	},
	error: function(req, stat, err) { 
//	    alert("Unable to bum: " + err);
	},
	success: function(data, stat, req) {
	    // success!
	}
    });
    $('.bummer_' + id).each(function(i, el) {
	$(el).html('Bummed');
	$(el).attr('bummed', 1);
    });
}

function rinse(html) {
    if (!html) { return ''; }
    return html.replace(/<.*?>/g, '');
}
