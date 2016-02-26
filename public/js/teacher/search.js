var List = function(listId){
	var list = new Object(this);
	this.id = listId;
	
	$('#search').bind("change paste keyup", function(){
		console.log($(this).val());
	});

	this.sort = function(){
		var items = $('#'+listId + ' li').get();

	}
}