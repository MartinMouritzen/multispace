var p2 = require('p2');
const uuidv1 = require('uuid/v1');

var GameObject = require('./GameObject.js');
var Ship = require('./Ship.js');

class Player extends GameObject {
	/**
	*
	*/
	constructor(socket,x,y) {
		super(x,y);
	
		this.id = socket.id;
		this.publicId = uuidv1();
		this.socket = socket;
		this.name = false;
		this.type = 'PLAYER';
		
		this.health = 100;
		this.shield = 50;
		
		this.ship = new Ship(x,y);
		
		this.lastShootTime = 0;
		this.weaponReloadTime = 0.1;
		
		// Initiate physics
		this.shipTurnSpeed = 12;
		this.shipSize = 30;
		this.shipShape = new p2.Circle({ radius: this.shipSize });

		this.rigidBody = new p2.Body({ mass: 1, position:[this.x,this.y], angularVelocity:1 });
		this.rigidBody.damping = 0.8;
		this.rigidBody.angularDamping = 0.8;
		this.rigidBody.addShape(this.shipShape);
		// this.rigidBody.collisionResponse = true;
		
		this.rigidBody.gameObjectType = this.type;
		this.rigidBody.gameObject = this;
		
		this.rigidBody.collisionMask = global.game.LASER;
		this.rigidBody.collisionGroup = global.game.SHIP;

		this.pressingRight = false;
		this.pressingLeft = false;
		this.pressingUp = false;
		this.pressingDown = false;
		this.shooting = false;
	}
	/**
	*
	*/
	hit(damage) {
		this.health -= damage;
		if (this.health < 0) {
			this.name = 'LOL DEAD!';
			this.rigidBody.mass = '2000';
		}
	}
	/**
	*
	*/
	increaseAngle() {
		this.rigidBody.angularVelocity = -this.shipTurnSpeed;
	}
	/**
	*
	*/
	decreaseAngle() {
        this.rigidBody.angularVelocity = this.shipTurnSpeed;
	}
	/**
	*
	*/
	updatePosition() {
		if (this.pressingRight) {
			this.decreaseAngle();
		}
		else if (this.pressingLeft) {
			this.increaseAngle();
		}
		else {
			this.rigidBody.angularVelocity = 0;
		}

		if (this.pressingUp) {
			this.rigidBody.applyForceLocal([0,-2400]);
		}
		else if (this.pressingDown) {
			this.rigidBody.applyForceLocal([0,600]);
		}
	}
}
module.exports = Player;