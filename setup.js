var connect = require('./routes/helpers/getsql');
var io = require('./app');
var ioHandle = require('./routes/io/sessionIO');
ioHandle.start(io);


var command = "SELECT * FROM `session` WHERE 1";
var sql = connect.getConnection();
if(sql != null){
	sql.query(command, function(err, rows){
		if(!err){
			for(var i = 0; i < rows.length; i++){
				if(rows[i].active == 0){
					runAtDate(new Date(Number(rows[i].start)), rows[i], function(data){
						activateSession(data);
					});
				}
				else if(rows[i].active == 1){
					shouldCreateUsers(rows[i]);
					ioHandle.createNamespace(rows[i].name, rows[i].id, rows[i].teacher);
					runAtDate(rows[i].endTime, rows[i], function(data){
						diactivateSession(data);
					});
				}
				else if(rows[i].active == 2){
					var future = new Date(Number(rows[i].endTime));
					future.setDate(future.getDate() + 30); 

					runAtDate(future, rows[i], function(data){
						deleteSessionUser(data.id);
						removeSession(data);
					});
				}
			}
		}
		else {
			console.log(err);
		}
	});
	sql.end();	
}

function shouldCreateUsers(data){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "SELECT `user` FROM `sessionuser` WHERE `session` = " + data.id;
		sql.query(command,
		function(err, rows){
			if(!err) {
				if(rows.length == 0){
					console.log('will create for session ' + data.id);
					addSessionToClasses(data.id, data.classes.split(','));
				}
			}
		});
		sql.end();
	}
}

function addSessionToClasses(id, classes){//sessionid
	var sql = connect.getConnection();
	if(sql != null){
		var ors = "";
		for(var i = 0; i < classes.length; i++){
			ors += "`id` = " + classes[i] + ((i != classes.length -1) ? " OR " : "");
		}
		var command = "SELECT `sessions`,`id` FROM `class` WHERE " + ors;
		sql.query(command,
		function(err, rows){
			if(!err) {
				console.log(rows);
				for(var i = 0; i < rows.length; i++){
					createSessionUsers(rows[i].id, id);
				}
			}
			else {console.log(err);}//perhaps tell teacher or something..
		});
		sql.end();
	}
}

function createSessionUsers(classID, sessionID){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "SELECT `name`,`mail`,`id` FROM `user` WHERE `class` = " + classID;
		sql.query(command, function(err, rows){
			if(!err){
				for(var i = 0; i < rows.length; i++){
					createSessionUser(rows[i], sessionID);
				}
			}
		});
		sql.end();
	}
}
function createSessionUser(userData, sessionID){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "INSERT INTO `sessionuser`(`name`, `mail`, `session`, `user`, `class`) VALUES ('"+userData.name+"', '"+userData.mail+"','"+sessionID+"','"+userData.id+"','"+userData.class+"')";
		sql.query(command, function(err){
			if(!err){
				//mail user
			}
		});
		sql.end();
	}
}

function deleteSessionUser(session){//session can have ORs etc..
	var sql = connect.getConnection();
	if(sql != null){
		var command = "DELETE FROM `sessionuser` WHERE `session` = " + session;
		sql.query(command);
		sql.end();
	}
}


function activateSession(data){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "UPDATE `session` SET `active`='1' WHERE `id`='"+data.id+"'";
		sql.query(command, function(err){
			if(!err){
				//create socket namespace
				ioHandle.createNamespace(data.name, data.id, data.teacher);
				runAtDate(data.endTime, data, function(data){
					ioHandle.deleteNameSpace(data.name, data.id);
					diactivateSession(data);
				});
			}
		});
		sql.end();
	}
}
function diactivateSession(data){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "UPDATE `session` SET `active`='2' WHERE `id`='"+data.id+"'";
		sql.query(command, function(err){
			if(!err){
				//remove socket namespace
				var future = new Date(data.endTime);
				future.setDate(future.getDate() + 30); //30 days 
				// future.setMinutes(future.getMinutes() + 5); //5 min

				runAtDate(future, data, function(data){
					deleteSessionUser(data.id);
					removeSession(data);
				});
			}
		});
		sql.end();
	}
}
function removeSession(data){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "DELETE FROM `session` WHERE `id`='"+data.id+"'";
		sql.query(command);
		sql.end();
	}
}

function runAtDate(date, data, cb) {
    (function loop() {
        var now = new Date();
        var d = (date - now);
        if (d <= 0 || !d) {//1min
            cb(data);
        }
        else {
	        now = new Date();                  // allow for time passing
	        var delay = 60000 - (now % 60000); // exact ms to next minute interval
	        setTimeout(loop, delay);
        }
    })();
}