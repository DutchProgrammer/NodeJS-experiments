var express 	= require('express'),
	app 		= express(),
	server 		= require('http').createServer(app),
	io   		= require('socket.io').listen(server),
	fs			= require('fs'),
	serverPort 	= 9002,
	mayMove		= true
;

server.listen(serverPort);

/*
app.get('/', function (req, res) {
	res.sendfile(__dirname+'/index.html');
});
*/

app.get('*', function (req, res) {
	var url = (req.url === '/' ? '/index.html' : req.url);

	fs.readFile(__dirname + url, function (err, data) {
		if (err) {
			console.log(err, 'not found ');
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write('404 file not found');
			res.end();
			return;
		}
		
		switch (url.split('.').pop()) {
			case 'css' :
				res.writeHead(200, {'Content-Type': 'text/css'});
			break;
			case 'js' :
				res.writeHead(200, {'Content-Type': 'text/js'});
			break;
			case 'html' :
				res.writeHead(200, {'Content-Type': 'text/html'});
			break;
			case 'png' :
				res.writeHead(200, {'Content-Type': 'image/png'});
			break;
			default:
			console.log('unkown file type');
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write('unkown file type');
			res.end();
			return;
		}

		res.write(data);
		res.end();
	});
});

io.sockets.on('connection', function (socket) {

	socket.emit('mayMove', mayMove);

	socket.on('changeMayMove', function(data) {
		mayMove = data;
		io.sockets.emit('mayMove', mayMove);
	});

	socket.on('castMove', function(position) {
		io.sockets.emit('castMove', position);
	});

	socket.on('disconnect', function (data) {

	});
});

console.log('server is running on '+serverPort);
