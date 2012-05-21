function init_buttons() {
  $('#get_code').mousedown(function() {
    var code = "&lt;div class='ft-fuckthat' data-layout='" + 
      $('input[name=layout]').attr('value') + "' data-url='" + 
      $('input[name=url]').attr('value') + "' data-width='" + 
      $('input[name=width]').attr('value') + "' data-color='" + 
      $('input[name=color]').attr('value') + "' data-font='" + 
      $('input[name=font]').attr('value') + "'&gt;&lt;/div&gt;" 
    set_ft_popup(code);
  });
  var html5_or_xfbml = $('input[name=html5_or_xfbml]');
  html5_or_xfbml.change(function() {
    var val = $(this).val();
    if (val == 'html5') {
      $('#like-code-html5').css('display', '');
      $('#like-code-xfbml').css('display', 'none');
    }
    else {
      $('#like-code-html5').css('display', 'none');
      $('#like-code-xfbml').css('display', '');
    }
  });
  html5_or_xfbml.trigger('change');
  $('#get_code2').mousedown(function() {
    var html_or_xfbml = $('input[type=hidden][name=html5_or_xfbml]').val();
    if (html_or_xfbml == 'html5') {
      var text = $('textarea[name=like-html5]').val();
      var el = $(text);
      if (el.attr('class') == 'fb-like') {
	var code = "&lt;div class='ft-fuckthat' data-layout='" +
	  (el.attr('data-layout') ? el.attr('data-layout') : 'standard') + "' data-url='" +
	  (el.attr('data-href') ? el.attr('data-href') : "") + "' data-width='" +
	  (el.attr('data-width') ? el.attr('data-width') : '450') + "' data-color='" + 
	  (el.attr('data-colorscheme') ? el.attr('data-colorscheme') : 'light') + "' data-font='" +
	  (el.attr('data-font') ? el.attr('data-font') : 'arial') + "'&gt;&lt;/div&gt;";
	set_ft_popup(code);
      }
      else {
	alert("Invalid HTML5 'like' code");
      }
    }
    else if (html_or_xfbml == 'xfbml') {
      var text = $('textarea[name=like-xfbml]').val();
      var el = $(text);
      if (el.get(0).tagName.toLowerCase() == 'fb:like') {
	var code = "&lt;div class='ft-fuckthat' data-layout='" +
	  (el.attr('layout') ? el.attr('layout') : 'standard') + "' data-url='" +
	  (el.attr('href') ? el.attr('href') : "") + "' data-width='" +
	  (el.attr('width') ? el.attr('width') : '450') + "' data-color='" + 
	  (el.attr('colorscheme') ? el.attr('colorscheme') : 'light') + "' data-font='" +
	  (el.attr('font') ? el.attr('font') : 'arial') + "'&gt;&lt;/div&gt;";
	set_ft_popup(code);
      }
    }
  });
  $('#get_tags').mousedown(function() {
    var html = "<h1>Open Graph Tags:</h1>" +
      "<h3>&lt;HEAD&gt;</h3>" +
      "<textarea>" +
      "&lt;meta property='og:title' content='" + escape($('input[name=og_title]').val()) + "' /&gt;\n" +
      "&lt;meta property='og:type' content='" + escape($('input[name=og_type]').val()) + "' /&gt;\n" +
      "&lt;meta property='og:url' content='" + escape($('input[name=og_url]').val()) + "' /&gt;\n" +
      "&lt;meta property='og:image' content='" + escape($('input[name=og_image]').val()) + "' /&gt;\n" +
      "&lt;meta property='og:site_name' content='" + escape($('input[name=og_site_name]').val()) + "' /&gt;\n" +
      "&lt;meta property='og:admins' content='" + escape($('input[name=og_admin]').val()) + "' /&gt;" +
      "</textarea>" +
      "<h3>&lt;/HEAD&gt;</h3>";
    set_popup(html);
  });
}

function set_ft_popup(code) {
    var html = "<h1>Fuck That Button plugin code:</h1>" +
      "<ol><li>Include the JavaScript SDK below on your page once, ideally right after the opening &lt;body&gt; tag.<br><br>" +
      "<textarea>&lt;div id='ft-root'&gt;&lt;/div&gt;\n" + 
      "&lt;script&gt;\n" +
      "(function(d, s, id) {\n" +
      "  var js, fjs = d.getElementsByTagName(s)[0]\n" +
      "  if (d.getElementById(id)) return;\n" +
      "  js = d.createElement(s); js.id = id;\n" +
      "  js.src = '//d1.pkt3.com:10052/assets/sdk.js';\n" +
      "  fjs.parentNode.insertBefore(js, fjs);\n" +
      "}(document, 'script', 'fuckthat-jssdk'));&lt/script&gt;" +
      "</textarea><br><br></li>" + 
      "<li>Place the code for your plugin wherever you want the plugin to appear on your page.<br><br><textarea>" + code + "</textarea></li></ol>";
    set_popup(html);
}

function set_popup(html) {
  html += "<div class='popupbottom'><a class=button href=# id='popup_ok'>Okay</a><br style='clear: both;'></div>";
  var popup = $('#popup');
  var popupbackground = $('#popupbackground');
  popup.html(html);
  $('#popup_ok').click(close_popup);
  popup.css('top', ($(window).scrollTop() + 100) + 'px');
  popup.css('left', (($(document).width() / 2) - (popup.width() / 2)) + 'px');
  popup.css('display','');
  popupbackground.css('top', '0px');
  popupbackground.css('left', '0px');
  popupbackground.css('width', $(document).width() + 'px');
  popupbackground.css('height', $(document).height() + 'px');
  popupbackground.css('display', '');
}

function close_popup() {
  $('#popup').css('display','none');
  $('#popupbackground').css('display','none');
}
