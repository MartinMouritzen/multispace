var express = require('express');
var app = express();
var serv = require('http').Server(app);
var sanitizeHtml = require('sanitize-html');

var Obstacle = require('./server/Obstacle.js');
var Laser = require('./server/Laser.js');
var Player = require('./server/Player.js');
var AI = require('./server/AI.js');
var Trader = require('./server/Trader.js');
var Explosion = require('./server/Explosion.js');
var StarGate = require('./server/StarGate.js');
var SystemManager = require('./server/SystemManager.js');
var SpaceStation = require('./server/SpaceStation.js');

var p2 = require('p2');

global.game = {};
global.game.SHIP = Math.pow(2, 1);
global.game.LASER = Math.pow(2, 2);
global.game.OBSTACLE = Math.pow(2, 3);
global.game.STARGATE = Math.pow(2, 4);

class Server {
	constructor() {
		this.ai = [];
		this.traders = [];
		this.players = {};
		this.gameObjects = [];
		this.starGates = [];
		this.spaceStations = [];
		this.lastTraderSpawn = 0;
		this.traderSpawnInterval = 10; // Faster spawning for more traders
		this.maxTraders = 10; // Much more traders for lived-in feel
		this.systemManager = new SystemManager();
		
		// Debug tracking for traders
		this.traderDebug = {};
		this.debugMode = process.env.DEBUG === 'true' || process.env.PORT === '20002';
	}
	/**
	*
	*/
	init() {
		this.initStaticFiles();

		var port = process.env.PORT || 20001;

		serv.listen(port);
		console.log("Server started at port: " + port);

		this.world = new p2.World({
			gravity: [0, 0],
		});
		this.world.defaultContactMaterial.friction = 0;

		this.world.on("beginContact", (event) => {
			this.collisionDetected(event);
		});

		global.game.world = this.world;
		global.game.systemManager = this.systemManager;
		global.game.server = this; // Add server reference for debugging

		this.addObstacles();
		this.addStarGates();
		this.addSpaceStations();

		var io = require('socket.io')(serv, {});

		io.sockets.on('connection', (socket) => {
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
		this.addAI(50, 50);
		this.addAI(200, 200);
		
		// Spawn initial traders after a short delay to ensure everything is initialized
		setTimeout(() => {
			if (this.debugMode) {
				console.log('Attempting initial trader spawn...');
			}
			// Spawn traders in different systems for variety
			this.spawnTraderInSystem('sol');
			this.spawnTraderInSystem('sol'); // Two in Sol where players start
			this.spawnTraderInSystem('alpha');
			if (this.debugMode) {
				console.log(`Initial spawn complete. Traders: ${this.traders.length}`);
			}
		}, 100);


		setInterval(() => { this.tick() }, 1000 / 25);
		
		// Debug commands
		this.setupDebugCommands();
	}
	
	setupDebugCommands() {
		// Only enable debug commands on debug port
		if (process.env.PORT !== '20002') return;
		
		console.log('Debug mode enabled. Available commands:');
		console.log('  traders - List all traders and their states');
		console.log('  systems - Show all systems and planets');
		console.log('  gates - List all star gates');
		console.log('  spawn - Spawn a new trader');
		console.log('  trader - Detailed debug info for first trader');
		console.log('  physics - Show physics world state');
		
		process.stdin.on('data', (data) => {
			var command = data.toString().trim();
			this.handleDebugCommand(command);
		});
	}
	
	handleDebugCommand(command) {
		switch(command) {
			case 'traders':
				console.log('\n=== TRADERS ===');
				this.traders.forEach((trader, i) => {
					var velocity = trader.rigidBody.velocity;
					var speed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
					console.log(`Trader ${i}: System=${trader.currentSystem}, State=${trader.state}, Target=${trader.targetPlanet ? trader.targetPlanet.name : 'none'}, Pos=(${Math.round(trader.getX())}, ${Math.round(trader.getY())}), Speed=${speed.toFixed(2)}, Thrust=${trader.isThrusting}`);
				});
				console.log(`Total: ${this.traders.length} traders\n`);
				break;
				
			case 'systems':
				console.log('\n=== SYSTEMS ===');
				for (var systemId in this.systemManager.systems) {
					var system = this.systemManager.systems[systemId];
					console.log(`${systemId}: ${system.name}`);
					system.planets.forEach(p => {
						console.log(`  - ${p.name} at (${p.x}, ${p.y})`);
					});
				}
				console.log('');
				break;
				
			case 'gates':
				console.log('\n=== STAR GATES ===');
				this.starGates.forEach((gate, i) => {
					console.log(`Gate ${i}: ${gate.systemId} -> ${gate.targetSystem} at (${gate.getX()}, ${gate.getY()})`);
				});
				console.log('');
				break;
				
			case 'spawn':
				this.spawnTrader();
				console.log('Spawned new trader');
				break;
				
			case 'physics':
				console.log('\n=== PHYSICS WORLD STATE ===');
				console.log('World time:', global.game.world.time);
				console.log('Bodies in world:', global.game.world.bodies.length);
				console.log('Gravity:', global.game.world.gravity);
				console.log('Sleeping bodies:', global.game.world.bodies.filter(b => b.sleepState === p2.Body.SLEEPING).length);
				console.log('Default friction:', global.game.world.defaultContactMaterial.friction);
				break;
				
			case 'trader':
				// Dump detailed info for a specific trader
				if (this.traders.length > 0) {
					var trader = this.traders[0]; // First trader
					console.log('\n=== DETAILED TRADER DEBUG ===');
					console.log('ID:', trader.id);
					console.log('Position:', [trader.getX(), trader.getY()]);
					console.log('Velocity:', [...trader.rigidBody.velocity]);
					console.log('Force:', [...trader.rigidBody.force]);
					console.log('Mass:', trader.rigidBody.mass);
					console.log('Damping:', trader.rigidBody.damping);
					console.log('State:', trader.state);
					console.log('Target:', trader.targetPlanet);
					console.log('IsThrusting:', trader.isThrusting);
					console.log('Update count:', trader._updateCount);
					console.log('Body in world:', global.game.world.bodies.includes(trader.rigidBody));
					console.log('Body sleeping:', trader.rigidBody.sleepState);
					console.log('Current system:', trader.currentSystem);
					
					// Force values
					console.log('\nPhysics state:');
					console.log('World gravity:', global.game.world.gravity);
					console.log('Body type:', trader.rigidBody.type);
					console.log('Angle:', trader.rigidBody.angle);
					console.log('Angular velocity:', trader.rigidBody.angularVelocity);
				}
				break;
				
			default:
				console.log('Unknown command:', command);
		}
	}
	/**
	*
	*/
	initStaticFiles() {
		app.get('/', (req, res) => {
			res.sendFile(__dirname + '/client/game.html');
		});
		app.use('/js/', express.static(__dirname + '/client/js/'));
		app.use('/css/', express.static(__dirname + '/client/css/'));
		app.use('/resources/', express.static(__dirname + '/client/resources/'));
	}
	/**
	*
	*/
	broadcastToPlayersInZone(zoneId, messageType, message) {
		for (var i in this.players) {
			this.players[i].socket.emit(messageType, message);
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
	addAI(x, y) {
		var ai = new AI(x, y);
		global.game.world.addBody(ai.rigidBody);
		this.ai.push(ai);
	}
	/**
	*
	*/
	addTrader(x, y) {
		var trader = new Trader(x, y);
		global.game.world.addBody(trader.rigidBody);
		this.traders.push(trader);
	}
	/**
	*
	*/
	spawnTraderInSystem(systemId) {
		var system = this.systemManager.systems[systemId];
		if (!system) return;
		
		var spawnPlanet = system.planets[Math.floor(Math.random() * system.planets.length)];
		var angle = Math.random() * Math.PI * 2;
		var distance = 100 + Math.random() * 50; // Spawn much closer (100-150 units from planet)
		
		var spawnX = spawnPlanet.x + Math.cos(angle) * distance;
		var spawnY = spawnPlanet.y + Math.sin(angle) * distance;
		
		var trader = new Trader(spawnX, spawnY);
		trader.currentSystem = systemId;
		global.game.world.addBody(trader.rigidBody);
		this.traders.push(trader);
		
		// Give trader a small initial velocity to ensure movement starts
		trader.rigidBody.velocity[0] = Math.cos(angle) * 50;
		trader.rigidBody.velocity[1] = Math.sin(angle) * 50;
		
		if (this.debugMode) {
			console.log(`Spawned trader at (${spawnX.toFixed(0)}, ${spawnY.toFixed(0)}) in system ${systemId}`);
		}
		
		this.lastTraderSpawn = global.game.world.time;
		return trader;
	}
	
	/**
	*
	*/
	spawnTrader() {
		if (this.traders.length >= this.maxTraders) return;
		
		// Spawn traders in random systems
		var systemIds = Object.keys(this.systemManager.systems);
		var randomSystemId = systemIds[Math.floor(Math.random() * systemIds.length)];
		var system = this.systemManager.systems[randomSystemId];
		
		var spawnPlanet = system.planets[Math.floor(Math.random() * system.planets.length)];
		var angle = Math.random() * Math.PI * 2;
		var distance = 100 + Math.random() * 50; // Spawn much closer (100-150 units from planet)
		
		var spawnX = spawnPlanet.x + Math.cos(angle) * distance;
		var spawnY = spawnPlanet.y + Math.sin(angle) * distance;
		
		var trader = new Trader(spawnX, spawnY);
		trader.currentSystem = randomSystemId;
		global.game.world.addBody(trader.rigidBody);
		this.traders.push(trader);
		
		// Give trader a small initial velocity to ensure movement starts
		trader.rigidBody.velocity[0] = Math.cos(angle) * 50;
		trader.rigidBody.velocity[1] = Math.sin(angle) * 50;
		
		if (this.debugMode) {
			console.log(`Spawned trader at (${spawnX.toFixed(0)}, ${spawnY.toFixed(0)}) in system ${randomSystemId}`);
		}
		
		this.lastTraderSpawn = global.game.world.time;
	}
	
	addTrader(x, y) {
		// Deprecated - use spawnTrader instead
		var trader = new Trader(x, y);
		global.game.world.addBody(trader.rigidBody);
		this.traders.push(trader);
	}
	debug(message) {
		this.broadcastToPlayersInZone(-1, "debug", message);
	}
	/**
	*
	*/
	newConnection(socket) {
		socket.id = Math.random();

		var playerX = 500 - Math.floor(Math.random() * 700);
		var playerY = 500 - Math.floor(Math.random() * 700);

		var player = new Player(socket, playerX, playerY);

		this.world.addBody(player.rigidBody);

		this.players[socket.id] = player;

		socket.on('login', (data) => {
			this.players[socket.id].name = data.name;
			this.players[socket.id].active = true;

			socket.emit('loginCompleted', { 
				id: this.players[socket.id].id, 
				username: this.players[socket.id].name 
			});

			this.broadcastToPlayersInZone(0, 'newPlayer', {
				publicId: this.players[socket.id].publicId,
				name: this.players[socket.id].name,
				ship: 'stiletto'
			});
		});

		socket.on('chatMessage', (data) => {
			var chatMessage = sanitizeHtml(data.message, {
				allowedTags: []
			});
			for (var i in this.players) {
				this.players[i].socket.emit('chatMessage', {
					user: this.players[socket.id].name,
					message: chatMessage
				});
			}
		});

		socket.on('disconnect', () => {
			this.broadcastToPlayersInZone(0, 'playerLoggedOut', {
				publicId: this.players[socket.id].publicId,
				name: this.players[socket.id].name
			});

			global.game.world.removeBody(this.players[socket.id].rigidBody);
			this.players[socket.id].active = false;
			delete this.players[socket.id];
		});

		socket.on('keyPress', (data) => {
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
		
		// Star gate collisions
		if (event.bodyA.gameObjectType == 'STARGATE' && (event.bodyB.gameObjectType == 'PLAYER' || event.bodyB.gameObjectType == 'TRADER')) {
			this.handleStarGateCollision(event.bodyA.gameObject, event.bodyB.gameObject);
		}
		if (event.bodyB.gameObjectType == 'STARGATE' && (event.bodyA.gameObjectType == 'PLAYER' || event.bodyA.gameObjectType == 'TRADER')) {
			this.handleStarGateCollision(event.bodyB.gameObject, event.bodyA.gameObject);
		}
	}
	
	handleStarGateCollision(starGate, ship) {
		if (!starGate.canTeleport(ship.id)) return;
		
		// Check if the ship is in the same system as the star gate
		if (ship.currentSystem !== starGate.systemId) {
			// Ship is colliding with a star gate from another system, ignore it
			return;
		}
		
		// Set cooldown
		starGate.setCooldown(ship.id);
		
		// Teleport the ship
		ship.rigidBody.position[0] = starGate.targetX;
		ship.rigidBody.position[1] = starGate.targetY;
		
		// Reset velocity to prevent carrying momentum through the gate
		ship.rigidBody.velocity[0] = 0;
		ship.rigidBody.velocity[1] = 0;
		ship.rigidBody.angularVelocity = 0;
		
		// If it's a player, send system change notification
		if (ship.type === 'PLAYER' && ship.socket) {
			ship.currentSystem = starGate.targetSystem;
			try {
				ship.socket.emit('systemTransition', {
					from: starGate.systemId,
					to: starGate.targetSystem,
					newX: starGate.targetX,
					newY: starGate.targetY
				});
			} catch (e) {
				console.error('Error sending system transition:', e);
			}
		} else if (ship.type === 'TRADER') {
			ship.currentSystem = starGate.targetSystem;
			// Force trader to select new destination after teleport
			ship.targetPlanet = null;
			ship.needsDestination = true;
			// Reset thrust state
			ship.isThrusting = false;
			ship.isReversing = false;
		}
	}
	removeGameObject(gameObject, number) {
		if (!number) {
			for (var i in this.gameObjects) {
				var checkGameObject = this.gameObjects[i];
				if (checkGameObject == gameObject) {
					this.removeGameObject(gameObject, i);
					break;
				}
			}
		}
		else {
			this.gameObjects.splice(number, 1);
			if (gameObject.rigidBody) {
				global.game.world.removeBody(gameObject.rigidBody);
			}
		}
	}
	addStarGates() {
		// Add star gates for all systems
		for (var systemId in this.systemManager.systems) {
			var system = this.systemManager.systems[systemId];
			for (var gateData of system.starGates) {
				var starGate = new StarGate(
					gateData.x, 
					gateData.y, 
					gateData.targetSystem, 
					gateData.targetX, 
					gateData.targetY
				);
				starGate.systemId = systemId;
				this.world.addBody(starGate.rigidBody);
				this.starGates.push(starGate);
			}
		}
	}
	
	addSpaceStations() {
		// Add a space station orbiting Aurelia in Sol system
		var solSystem = this.systemManager.getSystem('sol');
		var aurelia = solSystem.planets.find(p => p.id === 'aurelia');
		
		if (aurelia) {
			var spaceStation = new SpaceStation(aurelia.x, aurelia.y, aurelia.name);
			spaceStation.systemId = 'sol';
			this.spaceStations.push(spaceStation);
		}
	}
	addObstacles() {
		// Example asteroid field - add several irregular polygon shapes
		// Removed for now. the triangles didn't really look like asteroids.

		/*
		// Large asteroid
		var asteroid1 = new Obstacle([
			[-50, -50],
			[0, -80],
			[50, -50],
			[80, 0],
			[50, 50],
			[0, 80],
			[-50, 50],
			[-80, 0]
		], {
			color: '#555555',
			name: 'Asteroid1'
		});

		// Translate to position
		for (let i = 0; i < asteroid1.vertices.length; i++) {
			asteroid1.vertices[i][0] += 400;
			asteroid1.vertices[i][1] += 400;
		}
		asteroid1.calculateCenter();

		// Add to world
		global.game.world.addBody(asteroid1.rigidBody);
		this.gameObjects.push(asteroid1);

		// Long rock formation
		var rockWall = new Obstacle([
			[0, 0],
			[400, 0],
			[400, 50],
			[0, 50]
		], {
			color: '#777777',
			name: 'RockWall'
		});

		// Translate to position
		for (let i = 0; i < rockWall.vertices.length; i++) {
			rockWall.vertices[i][0] += 800;
			rockWall.vertices[i][1] += 800;
		}
		rockWall.calculateCenter();

		// Add to world
		global.game.world.addBody(rockWall.rigidBody);
		this.gameObjects.push(rockWall);

		// Add a few more varied shapes
		var triangle = new Obstacle([
			[-100, -100],
			[100, -100],
			[0, 100]
		], {
			color: '#665577',
			name: 'TriangleRock'
		});

		// Translate to position
		for (let i = 0; i < triangle.vertices.length; i++) {
			triangle.vertices[i][0] += 1200;
			triangle.vertices[i][1] += 300;
		}
		triangle.calculateCenter();

		// Add to world
		global.game.world.addBody(triangle.rigidBody);
		this.gameObjects.push(triangle);
		*/
	}
	/**
	*
	*/
	tick() {
		this.world.step(1 / 60);
		var pack = [];

		for (var i in this.players) {
			var player = this.players[i];
			if (!player.name) {
				continue;
			}
			player.updatePosition();

			if (player.shooting && player.health > 0) {
				if (global.game.world.time - player.lastShootTime > player.weaponReloadTime) {
					var laser = new Laser(player.rigidBody.position[0], player.rigidBody.position[1], player.rigidBody.angle, player);
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

		for (var i = this.ai.length - 1; i >= 0; i--) {
			var aiPlayer = this.ai[i];

			// Check if AI is dead
			if (aiPlayer.health <= 0) {
				// Create explosion at AI position
				var explosion = new Explosion(aiPlayer.getX(), aiPlayer.getY());
				this.gameObjects.push(explosion);
				
				// Remove AI from world and array
				global.game.world.removeBody(aiPlayer.rigidBody);
				this.ai.splice(i, 1);
				continue;
			}

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

		// Handle trader spawning
		if (global.game.world.time - this.lastTraderSpawn > this.traderSpawnInterval) {
			if (this.debugMode) {
				console.log(`Trader spawn check: world.time=${global.game.world.time}, lastSpawn=${this.lastTraderSpawn}, interval=${this.traderSpawnInterval}, traders=${this.traders.length}/${this.maxTraders}`);
			}
			this.spawnTrader();
		}

		// Update space stations
		for (var spaceStation of this.spaceStations) {
			spaceStation.update(1 / 25); // deltaTime
		}

		// Update traders
		for (var i = this.traders.length - 1; i >= 0; i--) {
			var trader = this.traders[i];

			// Debug tracking
			if (this.debugMode) {
				this.trackTraderDebug(trader);
			}

			// Track update calls
			if (!trader._updateCount) trader._updateCount = 0;
			trader._updateCount++;
			
			trader.updateAI();

			// Only show traders that are not landed
			if (trader.state !== 'landed') {
				pack.push({
					type: 'TRADER',
					x: trader.getX(),
					y: trader.getY(),
					health: trader.health,
					shield: trader.shield,
					isThrusting: trader.isThrusting,
					isReversing: trader.isReversing,
					angle: trader.rigidBody.angle,
					id: trader.id,
					name: 'Trader',
					state: trader.state,
					currentSystem: trader.currentSystem
				});
			}
		}

		for (var i in this.gameObjects) {
			var gameObject = this.gameObjects[i];
			if (gameObject.dieTime && gameObject.dieTime <= global.game.world.time) {
				this.removeGameObject(gameObject, i);
				i--;
				continue;
			}

			// Basic object data
			var objectData = {
				type: gameObject.type,
				x: gameObject.getX(),
				y: gameObject.getY()
			};

			// Add type-specific data
			if (gameObject.type === 'OBSTACLE') {
				objectData.angle = gameObject.rigidBody.angle;
				objectData.vertices = gameObject.vertices;
				objectData.color = gameObject.options.color;
			} else if (gameObject.type === 'EXPLOSION') {
				objectData.particles = gameObject.getParticleData();
			} else {
				objectData.angle = gameObject.rigidBody.angle;
			}

			pack.push(objectData);
		}
		

		for (var i in this.players) {
			var player = this.players[i];
			
			// Create player-specific pack with entities from their current system only
			var playerPack = pack.filter(entity => {
				// Keep all non-location based entities
				if (!entity.x && !entity.y) return true;
				
				// Filter traders by system
				if (entity.type === 'TRADER' && entity.currentSystem !== player.currentSystem) {
					return false;
				}
				
				// Keep all other entities (players, AI, lasers, etc) for now
				// TODO: Eventually filter these by system too
				return true;
			});
			
			// Add star gates for the player's current system
			for (var starGate of this.starGates) {
				if (starGate.systemId === player.currentSystem) {
					playerPack.push({
						type: 'STARGATE',
						x: starGate.getX(),
						y: starGate.getY(),
						radius: starGate.radius,
						targetSystem: starGate.targetSystem,
						systemId: starGate.systemId
					});
				}
			}
			
			// Add space stations for the player's current system
			for (var spaceStation of this.spaceStations) {
				if (spaceStation.systemId === player.currentSystem) {
					playerPack.push({
						type: 'SPACESTATION',
						x: spaceStation.getX(),
						y: spaceStation.getY(),
						angle: spaceStation.angle,
						planetName: spaceStation.planetName
					});
				}
			}
			
			// Add current system info
			playerPack.push({
				type: 'SYSTEM_INFO',
				currentSystem: player.currentSystem
			});
			
			player.socket.emit('syncPositions', playerPack);
		}
		
		// Debug output for stuck traders
		if (this.debugMode && global.game.world.time % 5 < 0.04) { // Every 5 seconds
			this.debugStuckTraders();
		}
	}
	
	trackTraderDebug(trader) {
		if (!this.traderDebug[trader.id]) {
			this.traderDebug[trader.id] = {
				positions: [],
				velocities: [],
				lastCheck: global.game.world.time
			};
		}
		
		var debug = this.traderDebug[trader.id];
		debug.positions.push([trader.getX(), trader.getY()]);
		debug.velocities.push([...trader.rigidBody.velocity]);
		
		// Keep only last 50 entries
		if (debug.positions.length > 50) {
			debug.positions.shift();
			debug.velocities.shift();
		}
	}
	
	debugStuckTraders() {
		console.log('\n=== TRADER MOVEMENT DEBUG ===');
		var stuckCount = 0;
		
		this.traders.forEach((trader, i) => {
			var debug = this.traderDebug[trader.id];
			if (!debug || debug.positions.length < 10) return;
			
			// Check if trader moved in last 10 ticks
			var positions = debug.positions.slice(-10);
			var firstPos = positions[0];
			var lastPos = positions[positions.length - 1];
			var distance = Math.sqrt(
				Math.pow(lastPos[0] - firstPos[0], 2) + 
				Math.pow(lastPos[1] - firstPos[1], 2)
			);
			
			var velocity = trader.rigidBody.velocity;
			var speed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
			
			if (distance < 5 && trader.state === 'flying') {
				stuckCount++;
				console.log(`STUCK Trader ${i}:`);
				console.log(`  Position: (${Math.round(trader.getX())}, ${Math.round(trader.getY())})`);
				console.log(`  Target: ${trader.targetPlanet ? trader.targetPlanet.name : 'NONE'}`);
				console.log(`  State: ${trader.state}`);
				console.log(`  Speed: ${speed.toFixed(2)}`);
				console.log(`  Velocity: [${velocity[0].toFixed(2)}, ${velocity[1].toFixed(2)}]`);
				console.log(`  Force: [${trader.rigidBody.force[0].toFixed(2)}, ${trader.rigidBody.force[1].toFixed(2)}]`);
				console.log(`  Damping: ${trader.rigidBody.damping}`);
				console.log(`  Mass: ${trader.rigidBody.mass}`);
				console.log(`  IsThrusting: ${trader.isThrusting}`);
				console.log(`  Distance moved in 10 ticks: ${distance.toFixed(2)}`);
				
				// Extra debug - check if physics body is in world
				var bodyInWorld = global.game.world.bodies.includes(trader.rigidBody);
				console.log(`  Body in world: ${bodyInWorld}`);
			}
		});
		
		if (stuckCount === 0) {
			console.log('All traders are moving correctly!');
		} else {
			console.log(`\nFound ${stuckCount} stuck traders out of ${this.traders.length} total`);
		}
	}
}

var server = new Server();
server.init();

global.game.server = server;