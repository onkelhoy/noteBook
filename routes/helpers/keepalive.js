(function(){
	var connect = require('./getsql');
	module.exports = setInterval(function(){
		var sql = connect.getConnection();
		if(sql != null){
			sql.query("SELECT 1", function(err){
				if(err) console.log('error with sql ' + new Date());
				// else console.log('alive');
			});
			sql.end();
		}
	}, 18000000);
}())