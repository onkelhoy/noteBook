(function(){
	"use strict";
    var express = require('express');
    var routes = express.Router();
    var connect = require('./helpers/getsql');
    var filter = require('./helpers/filter');

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
	routes.delete('/:id', function(req, res){
		var id = req.params.id;
		if(id == -1 ||id == undefined) res.status(500).send('Lärare är ej definerad!');
		else if(!filter.num(id)) res.status(500).send('Olaglig id');
		else {
			var sql = connect.getConnection();
			if(sql != null){
				sql.query("DELETE FROM `user` WHERE `id` = " + id,
				  function(err, rows){
					if(err) res.status(500).send('databas error kan ej ta bort lärare');
					else res.send(id);
				});
			} else {
				res.status(500).send('databas error');
			}
		}
	});
	routes.post('/update', function(req, res){
		var id = req.body.id,
			name = req.body.name,
			mail = req.body.mail,
			pass = req.body.pass;
		if(!filter.num(id)) res.status(500).send('Error');
		else if(!filter.text(name)) res.status(500).send('Namn innehåller olagliga symboler!');
		else if(!filter.text(pass)) res.status(500).send('Lösenord innehåller olagliga symboler!');
		else if(!filter.mail(mail)) res.status(500).send('Icke godkänt mail!');
		else {
			var sql = connect.getConnection();
			if(sql != null){
				var command = "UPDATE `user` SET `name`='"+name+"',`password`='"+pass+"',`mail`='"+mail+"' WHERE `id`='"+id+"'"
				sql.query(command,
				  function(err, rows){
					if(err) res.status(500).send('databas error kan ej ta bort lärare');
					else res.send({name: name, pass: pass, mail: mail, id: id});
				});
			}
			else {
				res.status(500).send('databas error');
			}
		}
	});

	routes.post('/add', function(req, res){
		var name = req.body.name,
			password = req.body.pass,
			mail = req.body.mail;
		if(!filter.text(name)) res.status(500).send('Namn innehåller olagliga symboler!');
		else if(!filter.text(password)) res.status(500).send('Lösenord innehåller olagliga symboler!');
		else if(!filter.mail(mail)) res.status(500).send('Icke godkänt mail!');
		else {
			var sql = connect.getConnection();
			if(sql != null){
				var command = "INSERT INTO `user`(`name`, `password`, `mail`, `teacher`) VALUES ('"+name+"','"+password+"','"+mail+"',1)"
				sql.query(command,
				  function(err, rows){
					if(err) res.status(500).send('databas error kan ej ta bort lärare');
					else res.send({name: name, pass: password, mail: mail, id: rows.insertID});
				});
			} else {
				res.status(500).send('databas error');
			}
		}
	});

	module.exports = routes;
}());