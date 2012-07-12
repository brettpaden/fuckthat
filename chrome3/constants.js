var Bummer_Web_Server = 'http://__BUMMER_WEB_SERVER__';
var Bummer_Api_Server = 'http://__BUMMER_API_SERVER__';
var Google_Analytics_Code = '__GA_CODE__';

function do_fb_auth() {
      window.open(Bummer_Web_Server + '/pages/init_facebook_access_token', 'fb-auth-popup', config='height=460, width=580, toolbar=no, menubar=0, scrollbars=0, resizable=no, location=no, directories=no, status=no');
}
