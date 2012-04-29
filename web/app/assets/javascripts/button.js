function init_buttons() {
  $('#get_code').mousedown(function() {
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
      "<li>Place the code for your plugin wherever you want the plugin to appear on your page.<br><br><textarea>&lt;div class='ft-fuckthat' data-layout='" + 
      $('input[name=layout]').attr('value') + "' data-url='" + 
      $('input[name=url]').attr('value') + "' data-width='" + 
      $('input[name=width]').attr('value') + "' data-color='" + 
      $('input[name=color]').attr('value') + "' data-font='" + 
      $('input[name=font]').attr('value') + "'&gt;&lt;/div&gt;</textarea></li></ol>";
    set_popup(html);
  });
  $('#like-selector-html5').addClass('selected');
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
