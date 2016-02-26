(function(){
	"use strict";
	var sess = '';
    var express = require('express');
    var routes = express.Router();

    var student = require('./student');
    var teacher = require('./teacher');
    var admin = require('./admin');

	routes.get('/', function(req, res){
		var sess = req.session;
		if(!sess.username){
			res.redirect('/login');
		}
		else {
			if(sess.admin == 1){
				res.redirect('/admin');
			}
			else if(sess.teacher == 0){
				res.redirect('/student');
			}
			else {
				res.redirect('/teacher');
			}
		}
	});
	routes.use('/student', student);
	routes.use('/teacher', teacher);
	routes.use('/admin', admin);
	
	module.exports = routes;
}());