function init_button() {
  var button_el = $('#button');
  if (!Button || !button_el) {
    return;
  }
  init_facebook(function(data) {
    init_data_for_user(SessionUser);
  });
}
