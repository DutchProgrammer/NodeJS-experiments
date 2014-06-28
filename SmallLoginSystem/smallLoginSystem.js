var express    = require('express'),
	app        = express(),
	server     = require('http').createServer(app),
	fs         = require('fs'),
	serverPort = 9003,
	mysql      = require('mysql'),
	angular    = require('angular'),
	io   	   = require('socket.io').listen(server),
	connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'nodejs',
		password : '$sD5Ax2D#2!',
		database : 'NodeJSLoginSystem'
	}),
	crypto     = require('crypto'),
	algo       = 'sha256',
	nodemailer = require('nodemailer'), 
	sendMail   = nodemailer.createTransport('SMTP',{
	    service: 'Gmail',
	    auth: {
	        user: 'dutchprogrammer@gmail.com',
	        pass: 'dann6715'
	    }
	}).sendMail,
	emailSettings = {
		from 		: 'Small loginSystem',
		fromEmail 	: 'danny@kaboemprogrammeurs.nl'
	},
	signupMailTemplate = '/emails/signupMail.html',
	signupMail         = ''
;

server.listen(serverPort);

//maybe test http://nodejsdb.org/


//Retrieve signup HTML mail
fs.readFile(__dirname + signupMailTemplate, function (err, data) {
	if (err) {
		console.log(err, 'signupMail template not found ');
	}
	signupMail = data.toString();
});

/*
app.get('/', function (req, res) {
	res.sendfile(__dirname+'/index.html');
});
*/
function encrypt(str) {
	return crypto.createHash(algo).update(str.toString()).digest('hex');
}

app.get('*', function (req, res) {
	var url = (req.url === '/' ? '/index.html' : req.url);
		url = url.split('?')[0];

	//Dont let them read this file !!
	if (url === '/main.js') {
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.write('404 file not found');
		res.end();
		return;
	}

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


connection.connect();
io.sockets.on('connection', function (socket) {
	console.log('connected');

	socket.on('requestsignup', function (data) {
		var databaseTable = 'users';

		console.log('data: ',data);

		connection.query('SELECT ?? FROM ?? WHERE ? LIMIT 1', ['email', databaseTable, { 'email' : data.email }], function(err, selectResults) {
			var response = { status : 'error', message : 'unkown error' };

			if (err) {
				response.message = 'We cant procceed your request at this time, try again later';

			  	console.log('this: ', this);
			  	console.log('error: ', err);
				socket.emit('signupResult', response);
			} else if (selectResults.length > 0) {
				response.message = 'Email adress already exists';
				console.log(selectResults, 'selectResults');
				socket.emit('signupResult', response);
			} else {

				connection.beginTransaction(function(err) {

					if (err) { 
						console.log(err, 'err');
						response.message = 'We couldnt create your account';
						socket.emit('signupResult', response);
						return;
					}

					var insertData = { 
						'name' 		: data.name,
						'email' 	: data.email,
						'password'  : encrypt(data.password),
						'created' 	: (new Date)
					};

					connection.query('INSERT INTO ?? SET ?', [ databaseTable, insertData ], function(err, insertResults) {
						if (err) {
      						connection.rollback(function() {
								response.message = 'We couldnt create your account';
								socket.emit('signupResult', response);
							});

							return;
						}

						if (signupMail !== '') {
							var signupEmail = signupMail.replace('{{name}}', data.name).replace('{{email}}', data.email).replace('{{password}}', data.password);

							sendMail({
								from: 		emailSettings.fromName+" <"+emailSettings.fromName+">", // sender address
								to: 		insertData.email, // list of receivers
								subject: 	'Your account settings', // Subject line
								text: 		'Plain text mail', // plaintext body
								html: 		signupEmail // html body
							}, function(error, responseStatus) {
							    if(error) {
	      							connection.rollback(function() {	
							    		console.log('mailError', error);			
							        });

									response.message = 'We coulnt send you an email check if your mail is correct';						    	
								} else {
									response.status  = 'ok';
									response.message = 'Your account is succesfully made, you can singin now';


									response.user = {
										id: 	insertResults.insertId,
										name:   data.name,
										email:  data.email
									}
							    }

								connection.commit(function(err) {
									if (err) { 
										connection.rollback(function() {
											delete response.user;
							    			console.log('mailError', err);	
											response.message = 'We couldnt create your account';
											socket.emit('signupResult', response);
										});
									}
									
									socket.emit('signupResult', response);
								});
							    console.log(responseStatus); // response from the server	
							});
						} else {

							connection.commit(function(err) {
								if (err) { 
									connection.rollback(function() {
										delete response.user;
										response.message = 'We couldnt create your account';
										socket.emit('signupResult', response);
							    		console.log('mailError', err);	
									});

									return;
								}

								response.status  = 'ok';
								response.message = 'Your account is succesfully made, you can singin now';

								response.user = {
									id: 	insertResults.insertId,
									name:   data.name,
									email:  data.email
								}

								socket.emit('signupResult', response);
							});
						}
					});
				});
			}
		});
	});

	socket.on('requestLogin', function (data) {
		var databaseTable = 'users';

		console.log('data: ',data);

		connection.query('SELECT ?? FROM ?? WHERE ? AND ? LIMIT 1', [ [ 'id', 'email', 'name', 'role' ], databaseTable, { 'email' : data.email }, { 'password' : encrypt(data.password) }], function(err, selectResults) {
			var response = { status : 'error', message : 'unkown error', user: {} };

			if (err) {
				response.message = 'We cant procceed your request at this time, try again later';

			  	console.log('this: ', this);
			  	console.log('error: ', err);
				socket.emit('loginResult', response);
			} else if (selectResults.length === 0) {
				response.message = 'The data you have filled in is incorrect';
				console.log(selectResults, 'selectResults');
				socket.emit('loginResult', response);
			} else {
				response.status  = 'ok';
				response.message = 'You have succesfully singed in, we will redirect you to the restricted area';
				response.user    = {
					id: 	selectResults[0].id,
					name:   selectResults[0].name,
					email:  selectResults[0].email,
					role:   selectResults[0].role
				}

				socket.emit('loginResult', response);
			}
		});
	});

	socket.on('requestChangeAccount', function (data) {
		var databaseTable = 'users';
		var response = { status : 'error', message : 'unkown error', user: {} };
		console.log('requestChangeAccount', data);

		if (data.id === undefined || !angular.isNumber(data.id) ) {
			socket.emit('changeAccountResult', response);
			return;
		}

		var updateData = { 
			name : data.name,
			email : data.email
		};

		if (data.password !== undefined) {
			updateData.password = encrypt(data.password);
		}

		console.log(data, 'data');
		console.log(updateData, 'updateData');
		connection.query('UPDATE ?? SET ? WHERE ? LIMIT 1', [ databaseTable, updateData, { 'id' : data.id }], function(err, selectResults) {


			if (err) {
				response.message = 'We cant procceed your request at this time, try again later';

			  	console.log('this: ', this);
			  	console.log('error: ', err);
				socket.emit('changeAccountResult', response);

			} else {
				if (selectResults.changedRows === 1) {
					response.status  = 'ok';
					response.message = 'Your data has succesfully been changed';
					response.user    = {
						id: 	data.id,
						name:   updateData.name,
						email:  updateData.email
					}

					socket.emit('changeAccountResult', response);
				} else {
					response.message = 'We cant procceed your request at this time, try again later';

				  	console.log('this: ', this);
				  	console.log('selectResults: ', selectResults);
					socket.emit('changeAccountResult', response);
				}
			}
		});

		console.log('data: ',data);
	});

	socket.on('disconnect', function (data) {
		console.log(arguments, 'disconnected');
	});
});

//connection.end();

console.log('server is running on '+serverPort);
