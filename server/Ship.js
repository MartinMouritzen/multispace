var p2 = require('p2');
var GameObject = require('./GameObject.js');

class Ship extends GameObject {
	/**
	*
	*/
	constructor(x,y) {
		super(x,y);
		
		this.health = 100;
		this.shield = 50;
		
		this.isThrusting = false;
		this.isReversing = false;
		
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
		this.rigidBody.collisionResponse = true;
		
		this.rigidBody.collisionMask = global.game.LASER | global.game.OBSTACLE | global.game.STARGATE;
		this.rigidBody.collisionGroup = global.game.SHIP;
	}
	/**
	*
	*/
	hit(damage) {
		this.health -= damage;
		if (this.health < 0) {
			this.name = 'LOL DEAD!';
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
	goForward() {
		this.rigidBody.applyForceLocal([0,-2400]);
	}
	goBackward() {
		this.rigidBody.applyForceLocal([0,600]);
	}
}
module.exports = Ship;