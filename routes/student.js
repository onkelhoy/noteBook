(function(){
	"use strict";
    var express = require('express');
    var routes = express.Router();
    var connect = require('./helpers/getsql');
    var filer = require('./helpers/filter');
    var io = require('../app');
    var ioHandle = require('./io/sessionIO');
	ioHandle.start(io);


	routes.use('/', express.static('public'));

	routes.get('/', function(req, res){
		if(start(req, res)) {
			var sql = connect.getConnection();
			if(sql != null){
				var command = "SELECT `session` FROM `sessionuser` WHERE `user` = " + req.session.usn_id;//get all sessions belonging to this student
				sql.query(command,
				function(err, rows){
					if(err) res.status(500).send('Problem uppstod');
					else if(rows.length == 0) {
						res.render('student', {
							title: 'Home',
							status: 'home',
							sessions: [],
							username: req.session.username
						});
					}
					else { getSessions(req, res, rows); }
				});
				sql.end();
			}
			else {
				res.redirect('/sqlerror');
			}
		}
	});

	function getSessions(req, res, sessionIds){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "SELECT * FROM `session` WHERE ";
			for(var i = 0; i < sessionIds.length; i++){
				command += "`id` = " + sessionIds[i].session;
				if(i != sessionIds.length - 1){
					command += " OR ";
				}
			}
			sql.query(command, function(err, rows){
				if(!err) {
					res.render('student', {
						title: 'Home',
						status: 'home',
						sessions: rows,
						username: req.session.username
					});
				} else {console.log('error');}
			});
		}
	}

	routes.get('/session/:id', function(req, res){
		//get the usersession info
		routes.use('/session', express.static('public'));
		var id = req.params.id;
		if(filer.num(id)){
		if(start(req, res)) {
			var sql = connect.getConnection();
			if(sql != null){
				var command = "SELECT * FROM `session` WHERE `id` = " + id;
				sql.query(command,
				function(err, rows){
					if(err) res.status(500).send('Problem uppstod');
					else if(rows.length == 0) res.redirect('/');
					else {
						//should redirect to either editor or finish/comment page
						getSession(req, res, rows[0]);
					}
				});
				sql.end();
			}
			else {
				res.redirect('/sqlerror');
			}
		}} else {res.redirect('/bad index');}
	});
	routes.post('/session/comment', function(req, res){
		var id = req.body.session;
		var student = req.body.student;
		var msg = req.body.comment;

		if(start(req, res)){
			if(filer.num(id) && filer.num(student)){
				var sql = connect.getConnection();
				if(sql != null){
					var command = "UPDATE `sessionuser` SET `comments`='"+msg+"' WHERE `user` = '"+student+"' AND `session` = " + id;
					sql.query(command, function(err){
						if(err) res.status(500).end('error');
						else res.end('done');
					});
				} else res.status(500).end('sql error');
				//SEND MAIL
			}
		}
	});

	routes.get('/session/task/:id', function(req, res){
		routes.use('/session/task', express.static('public'));
		var id = req.params.id;
		if(filer.num(id)){
			if(start(req, res)){
				var sql = connect.getConnection();
				if(sql != null){
					var command = "SELECT * FROM `session` WHERE `id` = " + id;
					sql.query(command, function(err, row){
						if(err) res.status(500).send('error kan ej få värden');
						else if(row.length == 0) res.status(500).send('inga värden att hämta');
						else {
							res.render('defualt', {
								title: 'uppgift - '+row[0].name,
								type: 'task',
								task: row[0].task,
								name: row[0].name
							});
						}
					});
				} else res.status(500).send('sql error');
			}
		} else res.status(500).send('Kan ej läsa id');
	});
	function getSession(req, res, session){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "SELECT * FROM `sessionuser` WHERE `user` = " + req.session.usn_id + " AND `session` = " + session.id;
			sql.query(command,
			function(err, rows){
				if(err) res.status(500).send('Problem uppstod');
				else if(rows.length == 0) res.redirect('/');
				else {
					if(session.active == 1){ //editor page
						res.render('defualt', {
							title: session.name,
							type: 'editor',
							sessionuser: rows[0],
							session: session,
							username: req.session.username
						});
					}
					else if(session.active == 2){ //comment page
						if(req.session.usn_id == rows[0].user){
							res.render('defualt', {
								title: session.name,
								type: 'comment',
								sessionuser: rows[0],
								session: session,
								teacher: 0,//for comment 
								mail: req.session.mail,
								username: req.session.username
							});
						} else res.status(500).send('Du har ej behörighet här');
							
					}
					else {
						res.redirect('/');
					}
				}
			});
			sql.end();
		}
		else {
			res.redirect('/sqlerror');
		}
	}

	function start(req, res){
		var sess = req.session;
		if(!sess.username || sess.teacher == 1 || sess.admin == 1){
			res.redirect('/');
		}
		else {
			return true;
		}
	}
	module.exports = routes;
}());