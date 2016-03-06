var connect = require('../helpers/getsql');
var filter = require('../helpers/filter');
var _io;
exports.start = function(io){
	_io = io;
}
exports.createNamespace = function(name, id, teacher){
	var nsp = _io.of('/'+name+'-'+id);
	sessionEvents(nsp, teacher);
}
exports.deleteNameSpace = function(name, id){
	delete _io.nsps['/'+name+'-'+id];
}

function sessionEvents(nsp, teacher){
	nsp.on('connection', function(client){
		client.emit('getinfo');
		client.on('getID', connectnps);
		client.on('save', saveText);
		client.on('status', statusUpdate);
		client.on('teacher', teacherConnect);
		client.on('update', updateTask);

		client.on('disconnect', function(){
			this.broadcast.emit('clientoffline', {id: this.userid});
		});
	});
}
function updateTask(data){
	var client = this;
	if(filter.text(data.task)){
		var sql = connect.getConnection();
		if(sql != null){
			var commnad = "UPDATE `session` SET `task`='"+data.task+"',`wordcount`='"+data.words+"' WHERE `id` = " + data.id;
			sql.query(commnad, function(err){
				if(!err) client.broadcast.emit('update', data);
				else client.emit('updateError', 'error med sql');
			});
			sql.end();
		}
		else {
			client.emit('updateError', 'databas error');
		}
	} else client.emit('updateError', 'Innehåller felaktiga karaktärer');
}
function teacherConnect(){
	this.broadcast.emit('teacher');
}
function statusUpdate(data){
	this.broadcast.emit('statusUpdate', data);
}
function connectnps(data){
	this.userid = data.id;
	this.broadcast.emit('studentOnline', data);
}
function saveText(data){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		var commnad = "UPDATE `sessionuser` SET `text`='"+data.text+"', `words`="+data.words+"  WHERE `user` = '" + data.id + "' AND `session` = '" +data.session+"'";
		sql.query(commnad, function(err){
			if(err) client.emit('saveError');
			else client.emit('saved');
		});
		sql.end();
	}
	else {
		client.emit('saveError');
	}
}