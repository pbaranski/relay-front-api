var express = require('express');
var req = require('request');
var path = require('path');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
app.use('/public', express.static(__dirname + '/public'));  
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

var parseBody= function(body){
    console.log(body);
    var obj = {};
    try {
        obj = JSON.parse(body);
    } catch (error) {
        obj = 0
    }
    console.log('Server says -> look what I received\n' + JSON.stringify(obj));
    return obj
}


app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/api/lamp', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/lamp.json'));
});
app.get('/lamp', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/lamp.html'));
});

app.listen(80, function () {
    console.log('Example app listening on port 3000!');
});

app.get('/lampState', function(request, response){
    var filePath = path.join(__dirname + '/public/lamp.json');
    var file = fs.readFileSync(filePath, 'utf8');
    response.send(parseBody(file));
    response.end();
});

app.get('/lampOn', function(request, response){
    var filePath = path.join(__dirname + '/public/lamp.json');
	console.log('Saving to file');
	console.log(request.body);
	var writer = fs.createWriteStream(filePath);
	writer.write(JSON.stringify({"state":1}), { flag: 'wx' }, function (err) {
		if (err) throw err;
		console.log("It's saved!");
	});	 
	response.send({"state":1});
	response.end();
});

app.get('/lampOff', function(request, response){
    var filePath = path.join(__dirname + '/public/lamp.json');
    console.log('Saving to file');
    console.log(request.body);
    var writer = fs.createWriteStream(filePath);
    writer.write(JSON.stringify({"state":0}), { flag: 'wx' }, function (err) {
        if (err) throw err;
        console.log("It's saved!");
    });
    response.send({"state":0});
    response.end();
});

