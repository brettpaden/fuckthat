function log(data) {
    var params = { data: data };
    $.ajax({
        url: Bummer_Api_Server + '/api/errors/log',
        type: 'POST',
        data: params
    });
}
