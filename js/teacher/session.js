var socket = io('/'+session.name+'-'+session.id);
socket.emit('teacher');
socket.on('clientoffline', studentOffline);
socket.on('studentOnline', studentOnline);
socket.on('statusUpdate', studentStatus);
socket.on('updateError', function(text){
	showError(text,1);
});


$(document).ready(function(){
	setup();
	$('.clas > header').click(function(){
		var list = $(this).parent().children('ul');
		if(list.attr('clicked') == 0){
			list.attr('clicked', 1);
			list.slideUp();
		}
		else {
			list.attr('clicked', 0);
			list.slideDown('fast');
		}
	});
	$('li').click(function(){
		if(session.active == 2){
			window.location.href = "/teacher/submit/"+$(this).attr('index') + "/"+session.id;
		}
	});

	$('.upd').click(function(){
		if(session.active != 2){//Skall ej kunna ändras efteråt
			console.log({task: $('textarea').val(), words: $('#words').val(), id: session.id});
			socket.emit('update', {task: $('textarea').val(), words: $('#words').val(), id: session.id});
		}
	});
	$('.pdf').click(function(){
		$.ajax({
			url: session.id+'/pdf',
			type: 'GET',
			data: {
				id: session.id,
				users: students
			},
			error: function(xhr){
				console.log(xhr.responseText);
			},
			success: function(data){
				createPDF(data, function(res){
					var doc = new jsPDF();

					// We'll make our own renderer to skip this editor
					var specialElementHandlers = {
						'#break': function(element, renderer){
							return true;
						}
					};
					// All units are in the set measurement for the document
					// This can be changed to "pt" (points), "mm" (Default), "cm", "in"
					doc.fromHTML(res.prop('outerHTML'), 15, 15, {
						'width': 180, 
						'elementHandlers': specialElementHandlers
					});

					doc.output('dataurlnewwindow');
					var today = new Date();
					doc.save(session.name + "_" + today.displayDate() + ".pdf");
				});
			// pdf.save("test.pdf");
			// pdf.output('datauri');
			}
		});
	});
});

function setup(){
	$('#words').val(session.wordcount);
	if(session.active == 2){
		$('.upd').remove();
	}
	for(var i = 0; i < students.length; i++){
		setStudent(students[i]);
	}
}
function setStudent(student){
	var li = $('<li></li>').attr('index', student.id),
		i = $('<i class="fa fa-circle"></i>'),
		name = $('<span></span>').append(i).append(student.name).addClass('name'),
		active = $('<span></span>').text('ej aktiv').addClass('active'),
		status = $('<span></span>').text('offline').addClass('status');

	li.append(name).append(active).append(status);
	$("div.clas[index='"+student.class+"'] > ul").append(li);
}



//spy functions
function studentOnline(data){
	var studentElm = $("li[index='"+data.id+"']");
	studentElm.children('span.status').css('background-color', '#5cb85c').text('online');
	studentElm.children('span.name').children('i').css('color', '#5cb85c');
}
function studentOffline(data){
	var studentElm = $("li[index='"+data.id+"']");
	studentElm.children('span.status').css('background-color', '#d9534f');
	studentElm.children('span.name').children('i').css('color', '#333333');
	studentElm.children('span.active').text('ej aktiv');
}
function studentStatus(data){
	var studentElm = $("li[index='"+data.id+"']");

	var a = studentElm.children('span.active');
	if(data.active == 1){
		a.text('aktiv');
	}
	else {
		a.text('ej aktiv');
	}
}