// MODULES
var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	session = require('express-session');

// get the io
module.exports = io;
// CUSTOM MODULES
var ioHandler = require('./routes/ioHandle'),
	routes = require('./routes/index'),
	alive = require('./routes/helpers/keepalive');

// MODULE STARTS
ioHandler.start(io);//could be done better

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/', routes);

http.listen(3000, function(){
	console.log("Running on *3000");
});
