var connect = require('../helpers/getsql');
var filter = require('../helpers/filter');
var crypte = require('../helpers/crypte');

module.exports = function(io){
	io.on('connection', function(client){
		client.on('getsetup', setup);
		client.on('getclasses', classes);
		client.on('getclassesS', classesSimple);
		client.on('addclass', addclass);
		client.on('deleteClass', deleteClass);
		client.on('addStudent', addStudent);
		client.on('updateStudent', updateStudent);
		client.on('deleteStudent', deleteStudent);
		client.on('addSession', addSession);
	});
}

function addSession(data){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		var command = "INSERT INTO `session`(`name`, `task`, `wordcount`, `endTime`, `startTime`, `active`, `classes`, `teacher`) VALUES ('"+data.name+"','"+data.task+"','"+data.word+"','"+data.end+"','"+data.start+"','"+0+"','"+data.classes+"', '"+data.teacher+"')";
		sql.query(command, function(err){
			if(err){ client.emit('ans', {type: 'error', msg: 'Misslyckades att skapa session'});}
			else {
				client.emit('ans', {type: 'success', msg: 'Session skapad'});
				runAtDate(data.start, data, function(data){
					//if not already started then activate session
					console.log(data.name + " är nu startad");
					activateSession(data);
				});
			}
		});
		sql.end();
	} else { client.emit('sql-error') }

}

function activateSession(data){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "UPDATE `session` SET `active`='1' WHERE `teacher`='"+data.teacher+"' AND `name`='"+data.name+"' AND `classes`='"+data.classes+"'";
		sql.query(command, function(err){
			if(!err){
				//create socket namespace
				runAtDate(data.end, data, function(data){
					//if not already started then activate session
					console.log(data.name + " är nu avslutad");
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
		var command = "UPDATE `session` SET `active`='2' WHERE `teacher`='"+data.teacher+"' AND `name`='"+data.name+"' AND `classes`='"+data.classes+"'";
		sql.query(command, function(err){
			if(!err){
				//remove socket namespace
				var future = new Date();
				//future.setDate(future.getDate() + 30); //30 days
				future.setMinutes(future.getMinutes() + 5);

				runAtDate(future, data, function(data){
					//if not already started then activate session
					console.log(data.name + " är nu bortagen");
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
		var command = "DELETE FROM `session` WHERE `teacher`='"+data.teacher+"' AND `name`='"+data.name+"' AND `classes`='"+data.classes+"'";
		sql.query(command);
		sql.end();
	}
}

function runAtDate(date, data, cb) {
    (function loop() {
        var now = new Date();
        if (date - now <= 60000) {//1min
            cb(data);
        }
        else {
	        now = new Date();                  // allow for time passing
	        var delay = 60000 - (now % 60000); // exact ms to next minute interval
	        setTimeout(loop, delay);
        }
    })();
}

function deleteStudent(data){
	var client = this;
	if(data.id != undefined){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "DELETE FROM `user` WHERE id='"+data.id+"'";
			sql.query(command, function(err){
				if(err){ client.emit('ans', {type: 'error', msg: 'Eleven kunde ej bli raderad'});}
				else { 
					removeUpdate(data.class);
					client.emit('ans', {type: 'success', msg: 'Eleven har succesfullt blivit raderad'});
				}
			});
			sql.end();
		} else { client.emit('sql-error') }
	}
}
function removeUpdate(id){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "UPDATE `class` SET `students`= students - 1 WHERE `id`='"+id+"'";
		sql.query(command);
		sql.end();
	}
}
function updateStudent(data){
	var client = this;
	var ok = true;
	if(filter.text(data.name)){
		if(data.mail != ""){
			if(!filter.mail(data.mail)) ok = false;
		}
		if(ok){
			var sql = connect.getConnection();
			if(sql != null){
				var command = "UPDATE `user` SET "; //
				if(data.name != "") command +=  "`name`='"+data.name+"'";
				if(data.mail != "") command += ((data.name == "") ? "" : ", ") + "`mail`='"+data.mail+"'";
				command += " WHERE id = '"+data.id+"'";

				sql.query(command, function(err, rows){
					if(err){ client.emit('ans', {type: 'error', msg: 'error'}); }
					else if(rows.length == 0) { client.emit('ans', {type: 'error', msg: 'nothing to update'}); }
					else { client.emit('ans', {type: 'success', msg: 'Elev har succesfullt blivit updaterad'}); }
				});
				sql.end();
			} else { client.emit('sql-error') }
		}
	} else {client.emit('ans', {type:'error', msg:'Felaktig indata - [namn, mail]'});}
}
function addStudent(data){
	var client = this;
	if(filter.text(data.name) && filter.mail(data.mail)){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "INSERT INTO `user`(`name`, `password`, `mail`, `class`, `teacher`) VALUES ('"+data.name+"','"+data.password+"','"+data.mail+"','"+data.class+"','0')";
			sql.query(command, function(err, rows){
				if(err){ client.emit('ans', {type: 'error', msg: 'error'}); }
				else if(rows.length == 0) { client.emit('ans', {type: 'error', msg: 'nothing to select'}); }
				else { updateClass(data, client); }
			});
			sql.end();
		} else { client.emit('sql-error') }
	} else {client.emit('ans', {type:'error', msg:'Felaktig indata - [namn, mail]'});}
}
function updateClass(data, client){
	data.students++;
	var sql = connect.getConnection();
	if(sql != null){
		var command = "UPDATE `class` SET `students`= students + 1 WHERE `id`='"+data.class+"'";
		sql.query(command);
		sql.end();
	}
	client.emit('addStudent', data);
}
function setup(id){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		var command = "SELECT * FROM `user` WHERE `id` = '" + id + "'";
		sql.query(command, function(err, rows){
			if(err){ client.emit('ans', {type: 'error', msg: 'error'}); }
			else if(rows.length == 0) { client.emit('ans', {type: 'error', msg: 'nothing to select'}); }
			else { client.emit('setup', {sessions: getsessions(rows[0].sessions)}); }
		});
		sql.end();
	} else { client.emit('sql-error') }
}

function getsessions(sessionIds){
	if(sessionIds != null){
		var command = "SELECT name,id FROM `session` WHERE ";
		var arr = sessionIds.split(',');
		for(var i = 0; i < arr.length; i++){
			command += "id='"+arr[i]+"'" + ((i != arr.length - 1) ? " OR " : "");
		}

		var sql = connect.getConnection();
		if(sql != null){
			sql.query(command, function(err, rows){
				if(!err) return rows;
				else return null;
			});
			sql.end();
		}
	} return null;
}
function classesSimple(teacher){
	var client = this;
	if(teacher != null){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "SELECT * FROM `class` WHERE `teacher`='"+teacher+"'";
			sql.query(command, function(err, rows){
				if(err){ client.emit('ans', {type: 'error', msg: 'error'}); }
				else { client.emit('setup', rows); }
			});
			sql.end();
		} else { client.emit('sql-error') }
	} else { client.emit('ans', {type: 'error', msg: 'Du har inga klasser ännu'}); }
}
function classes(teacher){
	var client = this;
	if(teacher != null){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "SELECT * FROM `class` WHERE `teacher`='"+teacher+"'";
			sql.query(command, function(err, rows){
				if(err){ client.emit('ans', {type: 'error', msg: 'error'}); }
				else { fillClass(rows, client); }
			});
			sql.end();
		} else { client.emit('sql-error') }
	} else { client.emit('ans', {type: 'error', msg: 'Du har inga klasser ännu'}); }
}
function fillClass(classes, client){
	var k = 0;
	for(var i = 0; i < classes.length; i++){
		classes[i].pupils = [];
		if(classes[i].students != 0){//no need to check
			var command = "SELECT name,password,mail,id FROM `user` WHERE `class` = '"+classes[i].id+"' AND `teacher` = '0'";//incase
			getUser(command, i, function(rows, index){
				classes[index].pupils = rows;
				k++;
				if(k == classes.length){ //IF ERROR.. CHECK THIS
					client.emit('setup', classes);
				}
			});
		}
		else { 
			k++;
			if(k == classes.length){ //IF ERROR.. CHECK THIS
				client.emit('setup', classes);
			}
		}
	}
}
function getUser(command, index, callback){
	var sql = connect.getConnection();
	if(sql != null){
		sql.query(command, function(err, rows){
			if(!err) callback(rows, index);
			else callback([], index);
		});
		sql.end();
	}
}

function addclass(data){
	var client = this;
	if(data.name != "" && data.name != null){
		if(filter.text(data.name)){
			var sql = connect.getConnection();
			if(sql != null){
				var command = "INSERT INTO `class`(`name`, `teacher`) VALUES ('"+data.name+"', '"+data.id+"')";
				sql.query(command, function(err, rows){
					if(!err) getClassId(data, client);
					else client.emit('ans', {type:'error', msg: 'error'});
				});
				sql.end();
			} else { client.emit('sql-error') }
		}
		else { client.emit('ans', {type:'error', msg: 'Namn kan ej innehålla olagliga tecken'}); }
	} else { client.emit('ans', {type:'error', msg: 'Namn kan ej vara tomt'}); }
}
function getClassId(data, client){
	setTimeout(function() {
		var sql = connect.getConnection();
		var d = {name: data.name, id: null};
		if(sql != null){
			var command = "SELECT id,students FROM `class` WHERE `name`='"+data.name+"' AND `teacher`='"+data.id+"'";
			sql.query(command, function(err, rows){
				if(!err) {
					client.emit('addedClass', {name: data.name, id: rows[0].id, students: rows[0].students});}
				else {
					client.emit('addedClass', d);
				}
			});
			sql.end();
		}
	}, 200);
}

function deleteClass(id){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		var command = "DELETE FROM `class` WHERE id='"+id+"'";
		sql.query(command, function(err, rows){
			if(!err) {
				client.emit('ans', {type:'success', msg:'successfully removed class'});}
			else {
				client.emit('ans', {type:'error', msg:'error when deleting class'});
			}
		});
		sql.end();
	}

	var sql2 = connect.getConnection();
	if(sql2 != null){
		var command = "DELETE FROM `user` WHERE class='"+id+"' AND `teacher` = '0'";
		sql2.query(command);
		sql2.end();
	}
}