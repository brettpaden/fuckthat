function log(data) {
    var params = { data: data };
    $.ajax({
        url: Bummer_Root_Server + '/api/fucks/fuckthat',
        type: 'POST',
        data: params
    });
}
