// Top Fucks menu view
var TopFucksMenuView = Backbone.View.extend({
 
  set_tpl:function(tpl_data) {
    TopFucksMenuView.template_data = tpl_data;
    return this;
  },
  
  initialize:function () {
  },

  render:function () {
    $(this.el).html(_.template(TopFucksMenuView.template_data));
    return this;
  },

  events:{
    "click .top_fucks_menu_item"      : "doTopFucksMenu",
    "mouseover .top_fucks_menu_item"  : "selectMenuItem",
  },
  
  selectMenuItem:function(e) {
    $('.top_fucks_selected_menu_item').removeClass('top_fucks_selected_menu_item');
    $(e.currentTarget).closest('td').addClass('top_fucks_selected_menu_item');
  },
  
  doTopFucksMenu:function(e) {
    var $pc = $('.panelContainer');
    var $tp = $('.tabbedPanels');
    var $mp_div = $('#master_popup');
    $pc.hide().attr('visibility', false);
    $tp.find('.tabs a.active').removeClass('active');
    $('#top_thats_tab a').attr('class', 'active').text('Most Fucked ('+$(e.currentTarget).text()+')')+blur();
    App.onWhatChange (whatTab(), $(e.currentTarget).text());
    $pc.fadeIn(50);
    $mp_div.fadeOut(100);
    return false;
  },
});

