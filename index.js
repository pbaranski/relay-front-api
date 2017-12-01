var express = require('express');
var req = require('request');
var path = require('path');
var fs = require('fs')
var app = express();
var bodyParser = require('body-parser')
app.use('/public', express.static(__dirname + '/public'));  
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())

var mock_msg = {"name":"Er","version":{"number":"ERR"},"hostname":"NONE"}

var username = 'technical_administrator_user',
    password = 'pass1',
	url = 'https://streetsmart.parkeon.com/'
var services_sss = {
  parks: '/businesscustomer/parks/',
	contracts: '/enduser/contracts/',
	contracts_ui: '/ui/enduser/contracts/version',
	rights: '/parking/rights/',
	rights_ui: '/ui/parking/rights/version',
	tickets: '/parking/tickets/',
	tickets_ui: '/ui/parking/tickets/version',
	orders: '/enduser/orders/',
	orders_ui: '/ui/enduser/orders/version',
	tariffs: '/parking/tariffs/',
	tariffs_ui: '/ui/parking/tariffs/version',
	controls: '/enforcement/controls/',
	controls_ui: '/ui/enforcement/controls/version',
	fines: '/enforcement/frenchfines',
	finesproxy: '/enforcement/finesproxy',
	fines_ui: '/ui/enforcement/frenchfines/version',
  softwaredownloading: '/terminal/softwaredownloading',
	devicemonitoring: '/terminal/devicemonitoring'
}

var auth = {'auth': {
				'user': username,
				'pass': password,
				'sendImmediately': false
		}};

var auth_sat1 = {
			  'auth': {
				'user': 'admin',
				'pass': 'admin',
				'sendImmediately': false
			  }
		};

var gener_req = function(request, response, service) {
	var full_url = url + request.params.tagId + services_sss[request.params.ser_name]
    if(request.params.tagId === 'performance'){
		full_url = 'http://ec2-34-252-47-140.eu-west-1.compute.amazonaws.com' + services_sss[request.params.ser_name]
	}
	var auth_user = auth
		if((request.params.tagId === 'sat1') || (request.params.tagId === 'svt2') || (request.params.tagId === 'svt1')){
		auth_user = auth_sat1
	}
	console.log(full_url)
	req.get(
        full_url , auth_user,
        function (error, res, body){
          response.send(parseBody(body));
        }
  );
}

var parseBody= function(body){
		console.log(body);
		var obj = {};
		 try { 
				 obj = JSON.parse(body);
		} catch (error) {
				  obj = mock_msg
		}
          console.log('Server says -> look what I received\n' + JSON.stringify(obj));
		return obj
}

app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
app.get('/ser/:ser_name/:tagId', function(request, response){
  gener_req(request, response)
})
app.post('/save_files/:tagId', function(request, response){
    var filePath = path.join(__dirname + '/public/hist/' + request.params.tagId);
	console.log('Saving to file')
	console.log(request.body)
	var writer = fs.createWriteStream(filePath);
	writer.write(JSON.stringify(request.body), { flag: 'wx' }, function (err) {
		if (err) throw err;
		console.log("It's saved!");
	});	 
	response.send("OK")
	response.end();
})
app.post('/submitbo/:tagId', function(request, response){
    var filePath = path.join(__dirname + '/public/bo/' + request.params.tagId);
	console.log('Saving to file')
	console.log(request.body)
	var writer = fs.createWriteStream(filePath);
	writer.write(JSON.stringify(request.body), { flag: 'wx' }, function (err) {
		if (err) throw err;
		console.log("It's saved!");
	});	 
	response.send("OK")
	response.end();
})
app.get('/save_files', function(request, response){
	var files = [];
	var filePath = path.join(__dirname + '/public/hist/');
	fs.readdirSync(filePath).forEach(file => {
		console.log(file);
		files.push(file);
	  })
	response.send(files.reverse())
})
app.get('/save_files/:tagId', function(request, response){
	var filePath = path.join(__dirname + '/public/hist/' + request.params.tagId);
	var file = fs.readFileSync(filePath, 'utf8');
	response.send(parseBody(file))
})
app.get('/bos/:tagId', function(request, response){
	var filePath = path.join(__dirname + '/public/bo/' + request.params.tagId);
	var file = fs.readFileSync(filePath, 'utf8');
	response.send(parseBody(file))
})
app.get('/all_bo', function(request, response){
	var files = [];
	var filePath = path.join(__dirname + '/public/bo/');
	fs.readdirSync(filePath).forEach(file => {
		console.log(file);
		files.push(file);
	  })
	response.send(files.reverse())
})
app.delete('/bos/:tagId', function(request, response){
	var filePath = path.join(__dirname + '/public/bo/' + request.params.tagId);
	fs.unlink(filePath);
	fs.readdirSync(path.join(__dirname + '/public/bo/')).forEach(file => {
		console.log(file);
	  })
	response.send("OK")
	response.end()
})

app.delete('/save_files/:tagId', function(request, response){
	var filePath = path.join(__dirname + '/public/hist/' + request.params.tagId);
	fs.unlinkSync(filePath);
	fs.readdirSync(path.join(__dirname + '/public/hist/')).forEach(file => {
		console.log(file);
	  })
	response.send("OK")
	response.end()
})
