var interval = setInterval('check_value()', 100);

function check_value() {
  var status = $('#auth_holder').attr('status');
  if (status == 'ok') {
    window.close();
  } else if (status == 'fail') {
    clearInterval(interval);
    $('#auth_holder').html('Since access was not granted, you will be unable to use the bummer application...bummer.');
  }
}
