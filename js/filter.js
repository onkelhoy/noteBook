function textF(text) { //add in for special characters å,ä,ö.. etc
	if(text.match(/[^\w\s\-\.\,åöäÖÄÅ"'?!]/)){ // not valid
		return false;
	}
	else { // valid
		return true;
	}
}

function numF(num){
	try{
		var b = num * 2; 
		return true;
	}
	catch (e) {
		return false;
	}
}

function mailF(mail){
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(mail);
}