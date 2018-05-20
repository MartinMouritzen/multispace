var express = require('express');
var app = express();
var serv = require('http').Server(app);

var Player = require('./server/Player.js');

var p2 = require('p2');

class Server {
	/**
	*
	*/
	initStaticFiles() {
		app.get('/',(req, res) => {
			res.sendFile(__dirname + '/client/index.html');
		});
		app.get('/game',(req, res) => {
			res.sendFile(__dirname + '/client/game.html');
		});
		app.use('/client',express.static(__dirname + '/client'));
	}
	/**
	*
	*/
	broadcastToPlayersInZone(zoneId,messageType,message) {
		for(var i in this.players){
			this.players[i].socket.emit(messageType,message);
		}
	}
	/**
	*
	*/
	newConnection(socket) {
		socket.id = Math.random();
	 
		var player = new Player(socket);
		
		this.world.addBody(player.shipBody);
		
		this.players[socket.id] = player;
		
		socket.on('login',(data) => {
			this.players[socket.id].name = data.name;
			
			socket.emit('loginCompleted',{ id: this.players[socket.id].id });
			
			this.broadcastToPlayersInZone('newPlayer',{
				publicId: this.players[socket.id].publicId,
				name: this.players[socket.id].name,
				ship: 'stiletto'
			});
		});
		
		socket.on('chatMessage',(data) => {
			for(var i in this.players){
				this.players[i].socket.emit('chatMessage',{
					user: this.players[socket.id].name,
					message: data.message
				});
			}
		});
	   
		socket.on('disconnect',() => {
			delete this.players[socket.id];
		});
	   
		socket.on('keyPress',(data) => {
			if (data.inputId === 'all') {
				player.pressingLeft = false;
				player.pressingRight = false;
				player.pressingUp = false;
				player.pressingDown = false;
			}
			else if (data.inputId === 'left') {
				player.pressingLeft = data.state;
			}
			else if (data.inputId === 'right') {
				player.pressingRight = data.state;
			}
			else if (data.inputId === 'up') {
				player.pressingUp = data.state;
			}
			else if (data.inputId === 'down') {
				player.pressingDown = data.state;
			}
		});
	}
	/**
	*
	*/
	init() {
		this.players = {};
		this.initStaticFiles();

		serv.listen(20001);
		console.log("Server started.");
		
		this.world = new p2.World({
			gravity : [0,0],
		});
		
		var io = require('socket.io')(serv,{});

		io.sockets.on('connection',(socket) => {
		   this.newConnection(socket);
		});
		 
		setInterval(() => {
			this.world.step(1/60);
			var pack = [];

			for(var i in this.players){
				var player = this.players[i];
				if (!player.name) {
					continue;
				}
				player.updatePosition();
				
				pack.push({
					x: player.shipBody.position[0],
					y: player.shipBody.position[1],
					isThrusting: player.pressingUp,
					isReversing: player.pressingDown,
					angle: player.shipBody.angle,
					id: player.id,
					name: player.name
				});	
			}
			for(var i in this.players){
				this.players[i].socket.emit('newPositions',pack);
			}
		},1000 / 25);
	}
}

var server = new Server();
server.init();