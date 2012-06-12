$(function() {
  $('.ft-fuckthat').each(function() {
    var el = $(this);
    var html = "<iframe scrolling=no style='overflow: hidden; width: " + el.attr('data-width') + "px; height: 29px; border: none;' title='Fuck that WRITEME' src='http://d1.pkt3.com:10050/pages/embed_button?url=" + (el.attr('data-url') ? escape(el.attr('data-url')) : window.location.href ) + "&layout=" + el.attr('data-layout') + "&color=" + el.attr('data-color') + "&font=" + el.attr('data-font') + "'></iframe>";
    el.html(html);
  });
});
