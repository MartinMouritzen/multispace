var express = require('express');
var app = express();
var serv = require('http').Server(app);

var Laser = require('./server/Laser.js');
var Player = require('./server/Player.js');

var p2 = require('p2');

global.game = {};
global.game.SHIP = Math.pow(2,1);
global.game.LASER = Math.pow(2,2);

class Server {
	/**
	*
	*/
	initStaticFiles() {
		app.get('/',(req, res) => {
			res.sendFile(__dirname + '/client/game.html');
		});
		app.use('/js/',express.static(__dirname + '/client/js/'));
		app.use('/css/',express.static(__dirname + '/client/css/'));
		app.use('/resources/',express.static(__dirname + '/client/resources/'));
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
	 	
	 	var playerX = 500 - Math.floor(Math.random() * 700);
	 	var playerY = 500 - Math.floor(Math.random() * 700);
	 
		var player = new Player(socket,playerX,playerY);
		
		this.world.addBody(player.rigidBody);
		
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
			global.game.world.removeBody(this.players[socket.id].rigidBody);
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
			else if (data.inputId === 'shoot') {
				player.shooting = data.state;
			}
		});
	}
	/**
	*
	*/
	init() {
		this.players = {};
		this.gameObjects = [];
		this.initStaticFiles();

		serv.listen(20001);
		console.log("Server started.");
		
		this.world = new p2.World({
			gravity : [0,0],
		});
		this.world.defaultContactMaterial.friction = 0;
		
		this.world.on("beginContact",(event) => {
			this.collisionDetected(event);
		});
		
		global.game.world = this.world;
		
		var io = require('socket.io')(serv,{});

		io.sockets.on('connection',(socket) => {
			this.newConnection(socket);
		});
		 
		setInterval(() => { this.tick() },1000 / 25);
	}
	/**
	*
	*/
	collisionDetected(event) {
		// console.log(event.bodyA);
		// console.log(event.bodyB);
		// event.bodyB;
		
		if (event.bodyA.gameObjectType == 'LASER') {
			this.removeGameObject(event.bodyA.gameObject);
		}
		if (event.bodyB.gameObjectType == 'LASER') {
			this.removeGameObject(event.bodyB.gameObject);
		}
		if (event.bodyA.gameObjectType == 'PLAYER') {
			event.bodyA.gameObject.hit(5);
		}
		if (event.bodyB.gameObjectType == 'PLAYER') {
			event.bodyB.gameObject.hit(5);
		}
	}
	removeGameObject(gameObject,number) {
		if (!number) {
			for(var i in this.gameObjects) {
				var checkGameObject = this.gameObjects[i];
				if (checkGameObject == gameObject) {
					this.removeGameObject(gameObject,i);
					break;
				}
			}
		}
		else {
			this.gameObjects.splice(number,1);
			global.game.world.removeBody(gameObject.rigidBody);
		}
	}
	/**
	*
	*/
	tick() {
		this.world.step(1/60);
		var pack = [];

		for(var i in this.players) {
			var player = this.players[i];
			if (!player.name) {
				continue;
			}
			player.updatePosition();
			
			if (player.shooting && player.health > 0) {
				if (global.game.world.time - player.lastShootTime > player.weaponReloadTime || player.name == 'Avo') {
					var laser = new Laser(player.rigidBody.position[0],player.rigidBody.position[1],player.rigidBody.angle,player);
					global.game.world.addBody(laser.rigidBody);
					this.gameObjects.push(laser);
					player.lastShootTime = global.game.world.time;
				}
			}
			
			pack.push({
				type: 'PLAYER',
				x: player.rigidBody.position[0],
				y: player.rigidBody.position[1],
				health: player.health,
				shield: player.shield,
				isThrusting: player.pressingUp,
				isReversing: player.pressingDown,
				angle: player.rigidBody.angle,
				id: player.id,
				name: player.name
			});	
		}
		
		for(var i in this.gameObjects) {
			var gameObject = this.gameObjects[i];
			if(gameObject.dieTime && gameObject.dieTime <= global.game.world.time){
				this.removeGameObject(gameObject,i);
				i--;
				continue;
			}
			pack.push({
				type: gameObject.type,
				x: gameObject.rigidBody.position[0],
				y: gameObject.rigidBody.position[1],
				angle: gameObject.rigidBody.angle
			});
		}
		
		for(var i in this.players){
			this.players[i].socket.emit('newPositions',pack);
		}
		// console.log(this.gameObjects.length);
		// console.log(this.world.bodies.length);
	}
}

var server = new Server();
server.init();

game.server = server;