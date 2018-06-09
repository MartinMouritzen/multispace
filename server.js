var express = require('express');
var app = express();
var serv = require('http').Server(app);
var sanitizeHtml = require('sanitize-html');

var Laser = require('./server/Laser.js');
var Player = require('./server/Player.js');
var AI = require('./server/AI.js');

var p2 = require('p2');

global.game = {};
global.game.SHIP = Math.pow(2,1);
global.game.LASER = Math.pow(2,2);

class Server {
	constructor() {
		this.ai = [];
		this.players = {};
		this.gameObjects = [];
	}
	/**
	*
	*/
	init() {
		this.initStaticFiles();
		
		var port = 20001;

		serv.listen(port);
		console.log("Server started at port: " + port);
		
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
		
		var aiX = 1000;
		var aiY = 1000;
		// Just for test
		/*
		for(var i=0;i<200;i++) {
			this.addAI(aiX + (50 * i),aiY - (50 * i));
		}
		*/
		this.addAI(50,50);
		this.addAI(200,200);

		 
		setInterval(() => { this.tick() },1000 / 25);
	}
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
	addPlayer() {
		
	}
	/**
	*
	*/
	addAI(x,y) {
		var ai = new AI(x,y);
		global.game.world.addBody(ai.rigidBody);
		this.ai.push(ai);
	}
	debug(message) {
		this.broadcastToPlayersInZone(-1,"debug",message);
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
			this.players[socket.id].active = true;
			
			socket.emit('loginCompleted',{ id: this.players[socket.id].id });
			
			this.broadcastToPlayersInZone(0,'newPlayer',{
				publicId: this.players[socket.id].publicId,
				name: this.players[socket.id].name,
				ship: 'stiletto'
			});
		});
		
		socket.on('chatMessage',(data) => {
			var chatMessage = sanitizeHtml(data.message,{
				allowedTags: []
			});
			for(var i in this.players){
				this.players[i].socket.emit('chatMessage',{
					user: this.players[socket.id].name,
					message: chatMessage
				});
			}
		});
	   
		socket.on('disconnect',() => {
			this.broadcastToPlayersInZone(0,'playerLoggedOut',{
				publicId: this.players[socket.id].publicId,
				name: this.players[socket.id].name
			});
			
			global.game.world.removeBody(this.players[socket.id].rigidBody);
			this.players[socket.id].active = false;
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
	collisionDetected(event) {
		if (event.bodyA.gameObjectType == 'LASER' && event.bodyB.gameObjectType == 'PLAYER') {
			this.removeGameObject(event.bodyA.gameObject);
			event.bodyB.gameObject.hit(5);
		}
		if (event.bodyB.gameObjectType == 'LASER' && event.bodyA.gameObjectType == 'PLAYER') {
			this.removeGameObject(event.bodyB.gameObject);
			event.bodyA.gameObject.hit(5);
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
				if (global.game.world.time - player.lastShootTime > player.weaponReloadTime) {
					var laser = new Laser(player.rigidBody.position[0],player.rigidBody.position[1],player.rigidBody.angle,player);
					global.game.world.addBody(laser.rigidBody);
					this.gameObjects.push(laser);
					player.lastShootTime = global.game.world.time;
				}
			}
			
			pack.push({
				type: 'PLAYER',
				x: player.getX(),
				y: player.getY(),
				health: player.health,
				shield: player.shield,
				isThrusting: player.isThrusting,
				isReversing: player.isReversing,
				angle: player.rigidBody.angle,
				id: player.id,
				name: player.name
			});	
		}
		
		for(var i in this.ai) {
			var aiPlayer = this.ai[i];
			
			aiPlayer.updateAI();

			pack.push({
				type: 'PLAYER',
				x: aiPlayer.getX(),
				y: aiPlayer.getY(),
				health: aiPlayer.health,
				shield: aiPlayer.shield,
				isThrusting: aiPlayer.isThrusting,
				isReversing: aiPlayer.isReversing,
				angle: aiPlayer.rigidBody.angle,
				id: aiPlayer.id,
				name: 'Evil AI'
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
				x: gameObject.getX(),
				y: gameObject.getY(),
				angle: gameObject.rigidBody.angle
			});
		}
		
		for(var i in this.players){
			this.players[i].socket.emit('syncPositions',pack);
		}
	}
}

var server = new Server();
server.init();

global.game.server = server;