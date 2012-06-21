var Bum;
var Bummer_Root_Server = 'http://d1.pkt3.com:10050';
var Authenticated_Status = false;
var Access_Token;
var CSRF_Token;

var Port = chrome.extension.connect({ name: 'bummer_facebook' });
Port.onMessage.addListener(function(msg) {
    if (msg.type == 'access_token_response') {
	if (msg.access_token && msg.csrf_token) {
	    Access_Token = msg.access_token;
	    CSRF_Token = msg.csrf_token;
	    // WRITEME fetch from server here in a later version
	    if (!localStorage.bummer) {
		Bum = new Bummer();
		localStorage.bummer = JSON.stringify(Bum);
	    }
	    else {
		Bum = new Bummer(JSON.parse(localStorage.bummer));
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
	    //	alert(err + ':' + $(el).html());
		}
		if (id) {
		    $(el).find('.UIActionLinks_bottom').each(function(j, subel) {
			var bummed = Bum.bummed(id);
			var bum_html = '<a href="#" onclick="return false;" bummed="' + 
			    (bummed ? 1 : 0) +
			    '" data=\'' + 
			    data_as_string + 
			    '\' class="bummer_' + id + '">' +
			    (bummed ? 'Unbum' : 'Bummer') + 
			    '</a>';
			$(subel).prepend(bum_html + ' &middot; ');
			$(el).find('.bummer_' + id).click(function(ev) {
			    var el = $(ev.target);
			    if (el.attr('bummed') == 0) {
				bum_it(el);
			    }
			    else {
				unbum(el);
			    }
			});
		    });
		}
		$(el).find('div.commentActions').each(function(j, subel) {
		    var comment_id = $(subel).find('button.cmnt_like_link').attr('value');
		    if (comment_id) {
			data_as_json.comment_id = comment_id;
			id = 'comment_' + comment_id;
			var bummed = Bum.bummed(id);
			var bum_html = '<a href="#" onclick="return false;" bummed="' +
			    (bummed ? 1 : 0) + 
			    '" data=\'' + 
			    JSON.stringify(data_as_json) + 
			    '\' class="bummer_' + id + '">' +
			    (bummed ? 'Unbum' : 'Bummer') + 
			    '</a>';
			$(subel).children().last().before(bum_html + ' &middot; ');
			$(el).find('.bummer_' + id).click(function(ev) {
			    var el = $(ev.target);
			    if (el.attr('bummed') == 0) {
				bum_it(el);
			    }
			    else {
				unbum(el);
			    }
			});
		    }
		});
		$(el).attr('has_been_bummed', true);
	    }
	});
	Bum.finding_links = false;
    };
}

function bum_it(el) {
    var data = $.parseJSON(el.attr('data'));
    var id = (data.comment_id ? 'comment_' + data.comment_id : (data.target_fbid ? data.target_fbid : (data.fbid ? data.fbid : '')));
    Bum.addBum(id);
    localStorage.bummer = JSON.stringify(Bum);
    // WRITEME write to server
    var params = {
	url: 'http://www.facebook.com/' + data.target_profile_id + '/posts/' + data.target_fbid + (data.comment_id ? '?comment_id=' + data.comment_id : ''),
	instance_id: Bum.instance_id,
    };
    $.ajax({
	url: Bummer_Root_Server + '/api/fucks/fuckthat',
	type: 'POST',
	data: params,
	headers: {
	    'X-CSRF-Token': CSRF_Token
	},
	error: function(req, stat, err) { 
	    alert("Unable to bum: " + err);
	},
	success: function(data, stat, req) {
	    // success!
	}
    });
    $('.bummer_' + id).each(function(i, el) {
	$(el).html('Unbum');
	$(el).attr('bummed', 1);
    });
}

function unbum(el) {
    var data = $.parseJSON($(el).attr('data'));
    var id = (data.comment_id ? 'comment_' + data.comment_id : (data.target_fbid ? data.target_fbid : (data.fbid ? data.fbid : '')));
    Bum.removeBum(id);
    localStorage.bummer = JSON.stringify(Bum);
    // WRITEME write to server
    $.ajax({
	url: Bummer_Root_Server + '/api/fucks/unfuckthat',
	type: 'DELETE',
	data: params,
	headers: {
	    'X-CSRF-Token': CSRF_Token
	},
	error: function(req, stat, err) { 
	    alert("Unable to unbum: " + err);
	},
	success: function(data, stat, req) {
	    // success!
	}
    });
    $('.bummer_' + id).each(function(i, el) {
	$(el).html('Bummer');
	$(el).attr('bummed', 0);
    });
}

