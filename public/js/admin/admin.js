$(document).ready(function(){
	$('ul > li > button.btn-success').click(function(){
		alert($(this).parent().attr('index'));
	});
	$('ul > li > button.btn-danger').click(function(){
		alert($(this).parent().attr('index'));
	});
	$('ul > li > span > a').click(function(){
		if($(this).text() == 'Klicka för lösenord'){
			$(this).text('Lösenord - '+$(this).attr('pass'));
		}
		else { $(this).text('Klicka för lösenord'); }
	});
});

function addTeacher(){

}
function editTeacher(elm){

}
function removeTeacher(elm){

}
function confirm(callback){
	if(typeof(callback) === undefined){
		alert("null");
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