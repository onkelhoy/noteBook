(function(){
	"use strict";
    var express = require('express');
    var routes = express.Router();
    var connect = require('./helpers/getsql');

	routes.get('/', function(req, res){
		var sess = req.session;
		if(sess.admin != 1){
			res.redirect('/');
		}
		else {
			var sql = connect.getConnection();
			if(sql != null){
				sql.query("SELECT * FROM user WHERE teacher = '1'",function(err, rows){
					if(!err){
						res.render('admin', {
							title: 'Admin Page',
							status: 'admin',
							teachers: rows,
							username: sess.username
						});
					}
					else {
						res.render('admin', {
							title: 'Admin Page',
							status: 'admin',
							teachers: 'error',
							username: sess.username
						});
					}
				});
			} else {
				res.redirect('/sqlerror');
			}
		}
	});
	routes.post('/add', function(req, res){
		var teacher = req.body.teacher;
		console.log(teacher);
		res.end('good');
	});

	module.exports = routes;
}());