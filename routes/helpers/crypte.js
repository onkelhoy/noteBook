var values = [];
var chars = "MaeUqghiJjknOo,KAprSsltvNFyzB-CuDfEGd8H_bPQ6RLxTVWmXZ01cY2345w79.I";

for(var i = 0; i < chars.length; i++){
	values[chars[i]] = i;
}


exports.enCrypte = function(pass){
	return crypte(pass);
}

exports.isSame = function(encrypted, pass){
	if(crypte(pass, encrypted) == encrypted){
		return true;
	}
	else {
		return false;
	}
}

function crypte(pass, crypted){
	var l = pass.length;
	var index = Math.round(30/l);
	var del = values[pass[0]] + index;

	var re = "";
	for(var i = del%2; i < l; i += 2){
		re += pass[i];
	}
	pass += re;

	if(crypted === undefined){
		//return pass
		return encrypt(pass, getWheels());
	}
	else {
		//based on wheels
		return encrypt(pass, getWheels(crypted));
	}

}

function encrypt(pass, wheels){
	var starts = [];
	starts[0] = wheels[0];
	starts[1] = wheels[1];
	starts[2] = wheels[2];

	var done = "";
	var k = 0;
	var l = Math.round(30/pass.length);
	var abc = "";
	for(var j = 0; j < pass.length; j++){

		for(var i = 0; i < l; i++){
			var index = values[pass[j]];
			index += wheels[0];
			if(index >= chars.length){
				index = 0;
			} 
			index += wheels[1] * 2;
			if(index >= chars.length){
				index = 0;
			} 
			index += wheels[2] * 3;
			if(index >= chars.length){
				index = 0;
			}

			for(var m = 0; m < 3; m++){
				if(k==starts[m]){
					if(m == 0){
						abc += "a";
					}
					if(m == 1){
						abc += "b";
					}
					if(m == 2){
						abc += "c";
					}
					done += "#";
				}
			}

			// console.log(index);
			done += chars[index];
			k++;


			wheels[0]++;//can make a nice..
			if(wheels[0] > 7){
				wheels[0] = 0;
				wheels[1]++;
				if(wheels[1] > 7){
					wheels[1] = 0;
					wheels[2]++;
					if(wheels[2] > 7){
						wheels[2] = 0;
					}
				}
			}
		}
	}
	
	return done + abc;
}
function getWheels(pass){
	var wheels = [];
	if(pass === undefined){
		for(var i = 0; i < 3; i++){
			wheels[i] = Math.round(Math.random() * 7);
		}
	}
	else {
		var splits = pass.split('#');
		wheels[0] = 0;
		wheels[1] = 0;
		wheels[2] = 0;

		var keys = [];
		keys['a'] = 0;
		keys['b'] = 1;
		keys['c'] = 2;

		for(var i = 3; i > 0; i--){
			var abc = pass[pass.length - i];
			var v = 0;

			for(var j = 0; j < 4 - i; j++){
				v += splits[j].length;
			}
			wheels[keys[abc]] = v;
		}
	}
	return wheels;
}