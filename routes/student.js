(function(){
	"use strict";
    var express = require('express');
    var routes = express.Router();

	routes.get('/', function(req, res){
		var sess = req.session;
		if(!sess.username || sess.teacher == 1){
			res.redirect('/');
		}
		else {
			res.render('student', {
				title: 'Home',
				status: 'home',
				username: sess.username
			});
		}
	});

	module.exports = routes;
}());