initSample();
var editor = CKEDITOR.instances['editor'];
var socket = io("/"+TASKNAME + "-" + session.id);
console.log(socket);
socket.on('getinfo', function(){
	socket.emit('getID', {id: user.user});
});
socket.on('teacher', sendInfo);
socket.on('update', updateTask);

function sendInfo(){
	socket.emit('status', {id: user.user, active: focus});
	socket.emit('getID', {id: user.user});
}
function updateTask(data){
	alert('Nya updateringar har tillkommit till uppgift, updatera!');
}
	
window.onresize = function(){
	editor.resize('100%', window.innerHeight);
}
$(document).ready(function(){
	if(user.text == ''){
		//CKEDITOR.instances.editor.insertHtml('<p>This is a new paragraph.</p>');//.insertHtml("<h1>Välkommen</h1><p>til<em>"+TASKNAME+"</em></p>");
		// $('#editor').append($('<h1></h1>').text(''));
		// $('#editor').append($('<p></p>').text('till <em>'+ TASKNAME +'</em>'));
		$('#editor').text("<h1>Välkommen</h1><p>till "+session.teachername+"s uppgift <em>"+TASKNAME+"</em></p>");
	}
	else {
		$('#editor').text(user.text);
	}

	var saveing = null;
	var saveEffect = null;

	socket.on('saveError', function(){
		clearInterval(saveEffect);
		clearTimeout(saveing);
		$('.statusinfo').text('Misslyckad sparning');
		$('.save').text('');
		$('.time').text('');
	});

	editor.on('blur', function(event) {//save (ctrl + s)
	    setSave();
	});
	editor.on('change', function(event) {//save (ctrl + s)
	    if(saveing != null) clearTimeout(saveing);
	    saveEffectSet();
	    saveing = setTimeout(function(){
	    	setSave();
	    }, 3000);
	});
	$('button.btn').click(function() { 
		_save();
	});
	function setSave(){
		clearTimeout(saveing);
		_save();
	    saveEffectSet();
	}
	function _save(){
		var ckvalue = editor.getData();
		var d = CKEDITOR.plugins.get('wordcount').wordCount;
		socket.emit('save', {text: ckvalue, id: user.user, session: session.id, words: d});
	}
	function saveEffectSet(){
		clearInterval(saveEffect);
		$('.time').text('');
		$('.statusinfo').text('Sparar');
		saveEffect = setInterval(function(){
			var s = $('.save')
	    	if(s.text() == "..") s.text("...");
	    	else if(s.text() == ".") s.text('..');
	    	else s.text('.');
	    }, 300);
	}

	socket.on('saved', function(){
		$('.time').text(new Date().displayDate()); //when recive the data
	    clearInterval(saveEffect);
	    $('.save').text('');
	    $('.statusinfo').text('Senast sparad');
	});
	// setTimeout(loading_time, 2000);
});

Date.prototype.displayDate = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	var h = this.getHours().toString();
	var m = this.getMinutes().toString();
	var s = this.getSeconds().toString();
	return yyyy +"-"+ (mm[1]?mm:"0"+mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]) + " " + (h[1]?h:"0"+h)+":"+(m[1]?m:"0"+m)+":"+(s[1]?s:"0"+s); // padding
};

// focus
// window.onblur = function(){  
// 	ACTIVE=0;
// }  
// window.onfocus = function(){  
// 	ACTIVE=1;
// }
// function loading_time() {
// 	socket.emit('status', {id: user.user, active: ACTIVE});
// 	setTimeout(loading_time, 2000);
// }
var wfocus = false,
	eFocus = false,
	focus = 0;

editor.on('blur', function(){
	eFocus = false;
	send();
});

$(window).blur(function() {
	wfocus = false;
	send();
});

$(window).focus(function() {
	wfocus = true;
    send();
});

editor.on('focus', function(){
	eFocus = true;
	send();
});

function send(){
	if(!eFocus && !wfocus) {
		if(focus == 1){
			focus = 0;
			socket.emit('status', {id: user.user, active: focus});
		}
	}
	else {
		if(focus == 0){
			focus = 1;
			socket.emit('status', {id: user.user, active: focus});
		}
	}
}