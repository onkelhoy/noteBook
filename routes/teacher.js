(function(){
	"use strict";
    var express = require('express');
    var routes = express.Router();
    var io = require('../app');
    var ioHandle = require('./io/teacherIO')(io);
    
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
	routes.get('/session/:id', function(req, res){
		if(start(req, res)) {
			res.render('teacher', {
				title: 'Session',
				status: 'session',
				id: req.session.usn_id,
				username: req.session.username
			});
		}
	});

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