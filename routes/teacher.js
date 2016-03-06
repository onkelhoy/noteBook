(function(){
	"use strict";
    var express = require('express'),
   		routes = express.Router(),
		path = require('path'),
    	io = require('../app'),
   		ioHandle = require('./io/teacherIO')(io),
    	connect = require('./helpers/getsql'),
    	filter = require('./helpers/filter');
    
	routes.use('/', express.static('public'));

	routes.get('/', function(req, res){
		if(start(req, res)) {
			res.render('teacher', {
				title: 'Home',
				status: 'home',
				id: req.session.usn_id,
				username: req.session.username
			});
		}
	});
	routes.get('/class', function(req, res){
		if(start(req, res)) {
			res.render('teacher', {
				title: 'Classses',
				status: 'class',
				id: req.session.usn_id,
				username: req.session.username
			});
		}
	});
	routes.get('/create', function(req, res){
		if(start(req, res)) {
			res.render('teacher', {
				title: 'Classses',
				status: 'create',
				id: req.session.usn_id,
				username: req.session.username
			});
		}
	});
	routes.get('/submit/:userid/:sessionid', function(req, res){
		routes.use('/submit/:userid', express.static('public'));
		if(start(req, res)){
			var userid = req.params.userid;
			var sessionid = req.params.sessionid;
			if(filter.num(userid) && filter.num(sessionid)){
				var sql = connect.getConnection();
				if(sql != null){//should make a function with callback..
					var command = "SELECT * FROM `session` WHERE `id`="+sessionid;
					sql.query(command, function(err, row){
						if(err) res.status(500).send('error getting session');
						else if(row.length == 0) res.status(500).send('error session not found');
						else {
							if(row[0].teacher == req.session.usn_id){
								getSubmit(req, res, row[0], userid);
							}
							else {
								res.status(500).send('Du har ej behörighet');
							}
						}
					});
					sql.end();
				} else res.status(500).send('sql error');
			} else res.status(500).send('Cant read id\'s');
		}
	});
	routes.post('/submit/:userid/comment', function(req, res){
		var id = req.body.session;
		var student = req.params.userid;
		var msg = req.body.comment;

		if(start(req, res)){
			if(filter.num(id) && filter.num(student)){
				var sql = connect.getConnection();
				if(sql != null){
					var command = "UPDATE `sessionuser` SET `comments`='"+msg+"' WHERE `user` = '"+student+"' AND `session` = " + id;
					console.log(command);
					sql.query(command, function(err){
						if(err) res.status(500).end('error'); 
						else res.end('done');
					});
				} else res.status(500).end('sql error');
				//SEND MAIL
			}
		}
	});
	routes.get('/session/:id', function(req, res){
		routes.use('/session', express.static('public'));
		if(start(req, res)) {
			var id = req.params.id;
			if(filter.num(id)){
				var sql = connect.getConnection();
				if(sql != null){
					var command = "SELECT * FROM `session` WHERE `id` = " + id;
					sql.query(command, function(err, session){
						if(err) res.status(500).send('error getting session');
						else {
							if(session.length == 0) res.redirect('/');
							else sessionData(req, res, session[0]);
						}
					});
					sql.end();
				}
				else res.status(500).send('sql error');
			} else res.redirect('/');
		}
	});
	routes.get('/session/:id/pdf', function(req, res){
		if(start(req, res)){
			var users = req.query.users;
			var ret = [];
			for(var i = 0; i < users.length; i++){
				getSesUser(users[i].id, req.query.id, function(usd){
					ret.push(usd);
					if(ret.length == users.length){
						res.setHeader('Content-Type', 'application/json');
    					res.send(JSON.stringify(ret));
					}
				});
			}
		}
	});
	function getSesUser(id, session, callback){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "SELECT * FROM `sessionuser` WHERE `user` = '"+id+"' AND `session` = "+session;
			sql.query(command, function(err, row){
				if(!err) callback(row[0]);
				else callback(null);
			});
			sql.end();
		}
	}
	function getSubmit(req, res, session, userid){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "SELECT * FROM `sessionuser` WHERE `user` = '"+userid+"' AND `session` = '"+session.id+"'";
			sql.query(command, function(err, row){
				if(err) res.status(500).send('error getting session');
				else if(row.length == 0) res.status(500).send('error session not found');
				else {
					res.render('defualt', {
						title: session.name,
						type: 'comment',
						sessionuser: row[0],
						session: session,
						teacher: 1,//for comment 
						mail: req.session.mail,
						username: req.session.username
					});
				} 
			});
			sql.end();
		} else res.status(500).send('sql error');
	}
	function sessionData(req, res, session){
		var sqlClass = connect.getConnection();
		if(sqlClass != null){
			var ors = "";
			var arr = session.classes.split(',');
			for(var i = 0; i < arr.length; i++){
				ors += "`id` = " + arr[i];
				if(i != arr.length - 1) ors += " OR ";
			}
			var command = "SELECT * FROM `class` WHERE "+ors;
			sqlClass.query(command, function(err, classes){
				if(err) res.status(500).send('error getting classes');
				else {
					getStudents(req, res, session, classes);
				}
			});
			sqlClass.end();
		} else res.status(500).send('sql error');
	}
	function getStudents(req, res, session, classes){
		var sql = connect.getConnection();
		if(sql != null){
			var ors = "";
			for(var i = 0; i < classes.length; i++){
				ors += "`class` = "+classes[i].id;
				if(i != classes.length -1) ors += " OR ";
			}
			var command = "SELECT `id`,`name`,`mail`,`class` FROM `user` WHERE "+ors+" AND `teacher` = 0";
			sql.query(command, function(err, students){
				if(err) res.status(500).send('error getting classes');
				else {
					res.render('teacher', {
						title: 'Session',
						status: 'session',
						session: session,
						classes: classes,
						students: students,
						id: req.session.usn_id,
						username: req.session.username
					});
				}
			});
			sql.end();
		} else res.status(500).send('error getting students');
	}

	function start(req, res){
		var sess = req.session;
		if(!sess.username || sess.teacher == 0){
			res.redirect('/');
		}
		else {
			return true;
		}
	}
	module.exports = routes;
}());