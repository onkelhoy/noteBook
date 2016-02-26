$(document).ready(function(){
	socket = io('/');
	socket.on('setup', setup);
	socket.emit('getsetup', ID);

	function setup(data){
		if(data.sessions != null){
			for(var i = 0; i < data.sessions.length; i++){
				$('select').append($('<option></option>')
					.attr('id', data.sessions[i].id)
					.text(data.sessions[i].name));
			}
		}
	}
});