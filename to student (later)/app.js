var express = require('express');
var app = express();


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile('index.html');
});
app.get('/submit', function(req, res){
	res.sendFile(__dirname + '/public/output.html');
});


app.listen(3000, function(){
	console.log("listening 3000");
});