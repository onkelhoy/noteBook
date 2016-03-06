exports.stext = function(text) {
	if(text.match(/[^\w\s\-\.\,]/)){ // not valid
		return false;
	}
	else { // valid
		return true;
	}
}

exports.text = function(text) { //add in for special characters å,ä,ö.. etc
	if(text.match(/[^\w\s\-\.\,åöäÖÅÄ?!]/)){ // not valid
		return false;
	}
	else { // valid
		return true;
	}
}

exports.num = function(num){
	try{
		var b = num * 2; 
		return true;
	}
	catch (e) {
		return false;
	}
}

exports.mail = function(mail){
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(mail);
}