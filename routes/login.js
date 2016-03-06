(function(){
	"use strict";
	var sess = '';
    var express = require('express');
    var routes = express.Router();

    var connect = require('./helpers/getsql');
	var filter = require('./helpers/filter');
	var crypte = require('./helpers/crypte');

	routes.get('/', function(req, res){
		res.render('defualt', {
			title: 'login',
			type: 'login'
		});
	});

	routes.post('/', function(req, res){
		var user = req.body.user;
		var pass = req.body.password;

		if(filter.text(user) && filter.text(pass)){
			var sql = connect.getConnection();
			if(sql != null){
				var commnad = "SELECT * FROM `user` WHERE `name` = '" + user + "' AND `password` = '" + pass + "'";
				sql.query(commnad, function(err, rows){
					if(err) { res.end('error'); }
					else if(rows.length == 0) { res.end('Can\'t find user'); }
					else {
						req.session.admin = rows[0].admin;
						req.session.teacher = rows[0].teacher;
						req.session.usn_id = rows[0].id;
						req.session.mail = rows[0].mail;
						req.session.username = user;
						res.end('done');
					}
				})
			} else { res.end('sql-error'); }
		}
		else { res.end('Namn eller lösenord innehåller felaktiga symboler'); }
	});
	module.exports = routes;
}());