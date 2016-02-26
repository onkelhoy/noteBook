var socket = null;
$(document).ready(function(){
	socket = io('/');
	socket.on('setup', setup);
	socket.emit('getclassesS', ID);
	socket.on('ans', answer);

	// var userList = new List('classList', 'name');
});

function answer(ans){
	if(ans.type == 'error'){
		showError(ans.msg, 1);
	}
	else {
		showSuccess(ans.msg, 2);
	}
}
function toggleClasses(){
	if($('#classes').is(':visible')){
		$('#classes').slideUp('fast');
	}
	else {
		$('#classes').slideDown('fast');
	}
}

function submit(){
	var start = $('#start').val();
	var end = $('#end').val();
	var task = $('textarea').val();
	var word = $('#wordcount').val();
	var classs = $('#choosenClasses').val();
	var name = $('#name').val();

	var d1 = Date.parse(start),
		d2 = Date.parse(end),
		today = new Date();
	if(d1 && d2){
		if(d1 > d2){
			showError('Slut datumet är före start datumet!', 1);
		}
		else if (d1 < today){
			showError('Det valda datumet har redan varit!', 1);
		}
		else {
			var classes = classs.split(',');
			if(classes <= 1){
				showError('Ingen klass har valts', 1);
			}
			else {
				if(word == ""){ word = 300; }
				if(textF(task) && textF(classs) && numF(word) && textF(name)){
					//everything checked out so far
					if(name != "" && task != ""){
						socket.emit('addSession', {start: d1, end: d2, task: task, classes: classs, word: word, teacher: ID, name: name});
					}
					else {
						showError('Uppgift och namn måste vara angivna', 1);
					}
				}
				else {
					showError('Uppgift,namn,klasser eller antal ord innehåller felaktiga symboler', 1);
				}
			}
		}
	}
	else {
		showError('Datumen är inte korrekta', 1);
	}
}
function setup(data){
	for(var i = 0; i < data.length; i++){
		var li = $('<li></li>');
		li.attr('id', data[i].id);
		li.text(data[i].name);
		li.click(function(){
			$('#choosenClasses').tagsinput('add', $(this).text());
		});

		$('#classes').append(li);
	}
}