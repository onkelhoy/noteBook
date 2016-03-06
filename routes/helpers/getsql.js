var mysql = require('mysql');

exports.getConnection = function(){
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : '',
	  database : 'textbook'
	});
	 
	connection.connect(function(err){
		if(err){
			console.log('error with sql ');
			return null;
		}
	});
	return connection;
}
