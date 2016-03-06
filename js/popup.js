$(document).ready(function(){
	$('#popup').click(function(e){
		if (!$('#popup > div').is(e.target)  && $('#popup > div').has(e.target).length === 0){
			$('#popup').hide();
			$('#popup > div > div').hide();
		}
	});
})
function showError(msg, index){
	showPopup(index);
	$('.bg-danger').text(msg);
}
function showSuccess(msg, index){
	showPopup(index);
	$('.bg-success').text(msg);
}
function hidePop(){
	$('#popup').hide();
}
function showPopup(index){
	$('#popup').show();
	$('#popup > div > div').hide();
	$('#popup > div').children().eq(0).show();
	$('#popup > div').children().eq(index).show();
}