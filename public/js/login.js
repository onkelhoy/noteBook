function enterpress(e){
    if(e.keyCode == 13){
        login();
    }
}

function login(){
	var name = $('#username').val();
	var pass = $('#password').val();
	if(name != "" && pass != ""){
		$.post('/login', {
			user: name,
			password: pass
		}, function(ans){
			if(ans != 'done'){
				$('#error').text(ans);
			}
			else { window.location.href = '/'; }
		});
	} else { $('#error').text('Det saknas värden!'); }
}