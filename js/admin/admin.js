$(document).ready(function(){
	init();
});
function init(){
	$('ul > li > button.left').click(function(){
		var target = $(this).parent();

		$('#edit_name').attr('placeholder', target.children('span.name').text());
		$('#edit_mail').attr('placeholder', target.children('a.mail').text());
		showPopup(4);
		$('#edit_btn').unbind();
		$('#edit_btn').click(function(){
			editTeacher(target);
		});
		// alert($(this).parent().attr('index'));
	});
	$('ul > li > button.right').click(function(){
		var sp = $('#confirm').parent().children('p').children('span');
		sp.text($(this).parent().children('span.name').text());
		sp.attr('index', $(this).parent().attr('index'));
		showPopup(5);
	});
	$('ul > li > span > a').click(function(){
		if($(this).text() == 'Klicka för lösenord'){
			$(this).text('Lösenord - '+$(this).attr('pass'));
		}
		else { $(this).text('Klicka för lösenord'); }
	});

	$('#confirm').click(function(){
		var index = $(this).parent().children('p').children('span').attr('index');
		$(this).parent().children('p').children('span').attr('index', -1);
		if(index == -1){
			showError('Ingen lärare är vald', 1);
		}
		else {
			console.log('baaaaaaaajs');
			removeTeacher(index);
		}
		hidePop();
	});
}

function addTeacher(){
	var name = $('#add_name').val(),
		pass = generatePassword(10),
		mail = $('#add_mail').val();

	if(name == "" && mail == "") { showError('Du måste välja några värden!', 1); }
	else {
		$.ajax({
			url: 'admin/add',
			type: 'POST',
			data: {'name': name, pass: pass, mail: mail},
			error: function(xhr){
				showError(xhr.responseText, 1);
			},
			success: function(data){
				var li = $('<li></li>').attr('index', data.id);
				li.append($('<button></button>').attr('type', 'button').addClass('btn').addClass('left').text('Edit'));
				li.append($('<span></span>').addClass('name').text(data.name));
				li.append($('<span></span>').addClass('pass').append($('<a></a>').attr('href', 'javascript:void(0)')
					.addClass('btn').addClass('btn-link').attr('pass', data.pass).text('Klicka för lösenord')));
				li.append($('<a></a>').attr('href', 'mailto:'+data.mail+'?Subject=texbook%20-%20admin').addClass('mail').text(data.mail));
				li.append($('<button></button>').attr('type', 'button').addClass('btn').addClass('right').text('Remove'));
				$('ul').append(li);
				init();
				hidePop();
			}
		});
	}
}
function editTeacher(elm){
	var name = elm.children('span.name').text(),
		mail = elm.children('a.mail').text(),
		pass = elm.children('span.pass').children('a').attr('pass'),
		id = elm.attr('index');
	if($('#edit_name').val() != ""){
		name = $('#edit_name').val();
	}
	if($('#edit_mail').val() != ""){
		mail = $('#edit_mail').val();
	}
	if($('#edit_pass').prop('checked')){
		pass = generatePassword(10);
	}

	$.ajax({
		url: '/admin/update',
		type: 'POST',
		data: {name: name, id: id, mail: mail, pass: pass},
		error: function(xhr){
			showError(xhr.responseText, 1);
		},
		success: function(data){
			var li = $('li[index='+data.id+']');
			li.children('span.name').text(data.name);
			li.children('span.pass').children('a').attr('pass', data.pass).text('Klicka för lösenord');
			li.children('a.mail').attr('href', 'mailto:'+data.mail+'?Subject=texbook%20-%20admin').text(data.mail);
			hidePop();
		}
	});
}
function removeTeacher(id){
	$.ajax({
		url: '/admin/'+id,
		type: 'DELETE',
		error: function(xhr){
			showError(xhr.responseText, 1);
		},
		success: function(result){
			$('li[index='+result+']').remove();
		}
	});
}

function generatePassword(l){
	var alpha = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	var pass ="";
	for(var i = 0; i < l; i++){
		pass += alpha[Math.round(Math.random() * (alpha.length-1))]
	}
	return pass;
}