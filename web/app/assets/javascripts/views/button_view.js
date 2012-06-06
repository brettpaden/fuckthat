var ButtonView = Backbone.View.extend({
  initialize: function() {
  },
  render: function() {
    $(this.el).html(JST['button.html']());
    $('#content_div').html(this.el);
    init_custom_form_elements();
    init_buttons();
    return this;
  },
});
