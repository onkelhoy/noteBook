var socket = null;
$(document).ready(function(){
	socket = io('/');
	socket.on('setup', setup);
	socket.emit('getclassesS', ID);
	socket.on('ans', answer);
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
	var classs = $('#tags').val();
	var name = $('#name').val();

	var today = new Date();
	var a = start.split(/[^0-9]/),
		b = end.split(/[^0-9]/);
	var d1 = new Date (a[0],a[1]-1,a[2],a[3],a[4]);
	var d2 = new Date (b[0],b[1]-1,b[2],b[3],b[4]);


	if(d1 != undefined && d1 != null && d2 != undefined && d2 != null){
		if(d1 > d2){
			showError('Slut datumet är före start datumet!', 1);
		}
		else if (d1 < today){
			showError('Det valda datumet har redan varit!', 1);
		}
		else {
			var classes = classs.split(',');
			if(classes <= 1){
				showError('Ingen klass har valts', 1);//kanske krånglar fall en klass!!
			}
			else {
				if(word == ""){ word = 300; }
				if(textF(task) && numF(word) && textF(name)){
					//everything checked out so far
					if(name != "" && task != ""){
						socket.emit('addSession', {start: d1.getTime(), end: d2.getTime(), task: task, classes: classs, word: word, teacher: ID, name: name, sessionID: null, teachername: username});
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
	var json = [];
	for(var i = 0; i < data.length; i++){
		var li = $('<li></li>');
		li.attr('id', data[i].id);
		li.text(data[i].name);
		li.click(function(){
			for(var i = 0; i < json.length; i++){
				if(json[i].index == $(this).attr('id')){
					$('#tags').tagsinput('add', json[i]);
					break;
				}
			}
		});
		json.push({'index': data[i].id, 'name': data[i].name, 'col': data[i].id%4});
		$('#classes').append(li);
	}

	var engine = new Bloodhound({
	  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
	  queryTokenizer: Bloodhound.tokenizers.whitespace,
	  local: json
	});
	engine.initialize();

	var elt = $('#tags');
	elt.tagsinput({
	  tagClass: function(item) {
	    switch (item.col) {
	      case 0	: return 'label label-primary';
	      case 1	: return 'label label-danger label-important';
	      case 2	: return 'label label-success';
	      case 3	: return 'label label-default';
	      case 4	: return 'label label-warning';
	    }
	  },
	  itemValue: 'index',
	  itemText: 'name',
	  typeaheadjs: {
	    name: 'classes',
	    displayKey: 'name',
	    source: engine.ttAdapter()
	  }
	});
}