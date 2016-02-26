var socket = null;
$(document).ready(function(){
	socket = io('/');
	socket.on('setup', setup);
	socket.on('addedClass', _addclass);
	socket.on('ans', answer);
	socket.emit('getclasses', ID);
	socket.on('sql-error', function(){
		window.location.href = "/sqlerror";
	})
});

function answer(ans){
	if(ans.type == 'error') showError(ans.msg, 3);
	else if(ans.type == 'success') showSuccess(ans.msg, 4);
}

function setup(data){
	for(var i = 0; i < data.length; i++){
		var div = setupClass(data[i]);
		
		for(var j = 0; j < data[i].pupils.length; j++){
			var student = data[i].pupils[j];
			var li = setupStudent(student);
			div.children('div').children('ul').append(li);
		}
		$('.row').append(div);
	}
}

function editStudent(){
	var name = $('#e_student_name').val();
	var mail = $('#e_student_mail').val();
	if(name == "" && mail == ""){
		showError('Du har ej skrivit in några värden', 3);
	}
	else {
		socket.emit('updateStudent', {name: name, mail: mail, id: selectedClass.attr('id')});
	}
	if(name != "") selectedClass.children('span.s_name').text(name); 
	if(mail != "") selectedClass.children('span.s_mail').text(mail);
}
var selectedClass = null;
function addStudent(elm){
	selectedClass = elm;
	showPopup(1);
}
function _addStudent(){
	var name = $('#student_name').val();
	var mail = $('#student_mail').val();

	if(name != "" && mail != ""){
		hidePop();
		var password = generatePassword(8);
		var data = {name: name, mail: mail, password: password, class: selectedClass.attr('id'), students: selectedClass.attr('students')};
		socket.emit('addStudent', data);
		if(selectedClass != null){
			
			var li = setupStudent(data);
			selectedClass.children('div').children('ul').append(li);
			updateClassCount(selectedClass, 1);
		}
	}
	else {
		showError('Elev måste ha mail och namn', 3)
	}
}
function generatePassword(l){
	var alpha = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	var pass ="";
	for(var i = 0; i < l; i++){
		pass += alpha[Math.round(Math.random() * (alpha.length-1))]
	}
	return pass;
}
function deleteStudent(elm){
	//do maybe a confirm
	socket.emit('deleteStudent', {id: elm.attr('id'), class: elm.parent().parent().parent().attr('id')});
	updateClassCount(elm.parent().parent().parent(), -1);
	elm.remove();
}

function addClass(){
	var name = $('#addclass').val();
	if(socket != null){
		console.log("add");
		socket.emit('addclass', {name: name, id: ID});
	}
	else {
		console.log('dont');
	}
}
function removeClass(elm){
	elm.parent().parent().remove();

	socket.emit('deleteClass', elm.attr('index'));
}
function _addclass(data){
	var div = setupClass(data)
	$('.row').append(div);
}

function setupStudent(data){
	var li = $('<li></li>');
	li.attr('id', data.id);
	li.append($('<button></button>').append($('<i class="fa fa-cog"></i>')).append(' edit').addClass('btn').click(function(){
		selectedClass = $(this).parent();
		showPopup(5);
	}));
	li.append($('<span class="s_name"></span>').text(data.name));
	li.append($('<a></a>').attr('href', 'javascript:void(0)').attr('pass', data.password).text('visa lösenord').click(function(){
		if(!$(this).hasClass('bg-info')) {
			$(this).text($(this).attr('pass') + ' - dölj');
			$(this).addClass('bg-info');
		}
		else {
			$(this).removeClass('bg-info');
			$(this).text('visa lösenord');
		}
	}));
	li.append($('<span class="s_mail"></span>').text(data.mail));
	li.append($('<button></button>').text('ta bort ').append($('<i class="fa fa-ban"></i>')).addClass('btn').click(function(){
		deleteStudent($(this).parent());
	}));

	return li;
}
function updateClassCount(elm, add){
	var c = Number(elm.attr('students')) + add;
	elm.attr('students', c);
	elm.children('header').children('span.count').text('Elever - ' + c);
}
function setupClass(data){
	var div = $('<div></div>');
		div.attr('id', data.id);
		div.attr('students', data.students);
	var header = $('<header></header>').attr('clicked', 0);
		header.click(function(){
			var s = $(this).parent().children('div');
			if($(this).attr('clicked') == 0){
				$(this).attr('clicked', 1);
				s.slideDown('fast');
			}
			else {
				$(this).attr('clicked', 0);
				s.slideUp();
			}
		});
		header.append($('<span></span>').text('Klass - '+data.name));
		var text = 'Tillgivna sessioner - '+data.sessions;
		if(data.sessions == undefined) text = 'Inga aktiva sessioner'
		header.append($('<span></span>').text(text));
		header.append($('<span class="count"></span>').text('Elever - ' + data.students));
		header.append($('<button></button>').attr('index', data.id).text('ta bort').addClass('btn btn-danger').click(function(){
			removeClass($(this));
		}));
	var body = $('<div></div>');
	var list = $('<ul></ul>');
	var footer = $('<footer></footer>').addClass('btn btn-success').text('LÄGG TILL ELEV ');
		footer.append($('<i class="fa fa-plus-circle"></i>'));
		footer.click(function(){
			addStudent($(this).parent().parent());
		});

	div.append(header);
	body.append(list);
	body.append(footer);
	div.append(body);
	return div;
}