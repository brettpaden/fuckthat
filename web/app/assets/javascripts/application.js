function init_custom_form_elements() {
  $('a').each(function() {
    var el = $(this);
    var dh = el.attr('data-hover');
    if (dh) {
      if (dh == 'tooltip') {
	el.hover(
	  function() {
	    var el = $(this);
	    var tip = $('#tip');
	    var offset = el.offset();
	    tip.html(el.attr('tip'));
	    tip.css('display','');
	    tip.offset({ top: offset.top - 24, left: offset.left });
	  },
	  function() {
	    var tip = $('#tip');
	    tip.css('display','none');
	  }
	);
      }
    }
  });
  $('select').each(function() {
    var el = $(this);
    var data = el.attr('data');
    if (data) {
      var parts = data.split(',');
      var name = el.attr('name');
      var html = 
	"<input type='hidden' name='" + name + "' />" +
	"<div id='select_" + name + "' class='select'></div>" +
	"<div id='options_" + name + "' class='options' style='display: none;'>";
      for(var x=0; x<parts.length; x++) {
	var pair = parts[x].split('|');
	var option_value = pair[0];
	var option_name = pair[1] ? pair[1] : pair[0].replace('_',' ');
	html += "<div class='option' value='" + option_value + "'>" + option_name + "</div>";
      }
      html += "</div>";
      html = "<div class='select_wrapper'>" + html + "</div>";
      el.replaceWith(html);
      set_selected(name);
      $('#select_' + name).mousedown({ name: name }, function(event) {
	var name = event.data.name;
	if ($('#options_' + name).css('display') != 'none') {
	  $('#options_' + name).css('display','none');
	  $(this).showing = false;
	}
	else {
	  $('#options_' + name).css('display','');
	  $(this).state = true;
	}	
      });
      $('#options_' + name).children('div.option').each(function() {
	$(this).mousedown({ name: name }, function(event) {
	  var name = event.data.name;
	  var val = $(this).attr('value');
	  $('input[name=' + name + ']').attr('value', val);
	  $('#options_' + name).css('display', 'none');
	  set_selected(name);
	});
      });
    }
  });
  $('input:radio').each(function() {
    var el = $(this);
    var val = el.attr('id');
    var label = $('label[for=' + val + ']');
    if (label) {
      var name = el.attr('name');
      var html = '';
      if (!$('input[type=hidden][name=' + name + ']').size()) {
	html += "<input type='hidden' name='" + name + "' />";
      }
      html += "<span class='radio' value='" + val + "' group='" + name + "'>" + label.html() + "</span>";
      label.replaceWith(html);
      if (el.attr('checked')) {
	set_radio(name, val);
      }
      el.remove();
      $('span[group=' + name + '][value=' + val + ']').mousedown(function() {
	var span = $(this);
	set_radio(span.attr('group'), span.attr('value'));
      });
    }
  });
}
function set_radio(name, val) {
  var hid_el = $('input[type=hidden][name=' + name + ']');
  var span = $('span[group=' + name + '][value=' + val + ']');
  var current_span = $('span[group=' + name + '][value=' + hid_el.attr('value') + ']');
  if (current_span) {
    current_span.removeClass('selected');
  }
  span.addClass('selected');
  hid_el.val(val).trigger('change');
}
function set_selected(name) {
  var selected = $('input[name=' + name + ']').attr('value');
  var value;
  var true_value;
  if (selected) {
    $('#options_' + name).children('div.option').each(function() {
      if ($(this).attr('value') == selected) { 
	var child = $(this);
	value = child.html();
	true_value = child.attr('value');
      }
    });
  }
  else {
    var first =  $('#options_' + name + ' div.option:nth-child(1)');
    value = first.html();
    true_value = first.attr('value');
  }
  $('#select_' + name).html(value);
  $('input[name=' + name + ']').attr('value', true_value);
}
