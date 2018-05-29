const uuidv1 = require('uuid/v1');

var GameObject = require('./GameObject.js');
var Ship = require('./Ship.js');

class Player extends Ship {
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
		this.rigidBody.gameObjectType = this.type;
		this.rigidBody.gameObject = this;
		
		this.pressingRight = false;
		this.pressingLeft = false;
		this.pressingUp = false;
		this.pressingDown = false;
		this.shooting = false;
	}
	/**
	*
	*/
	getAngle(normalized = false) {
		if (normalized) {
			var angle = this.rigidBody.angle % (2*Math.PI);
			if(angle < 0){
				angle += (2 * Math.PI);
			}
			return angle;
		}
		return this.rigidBody.angle;
	}
	/**
	*
	*/
	getX() {
		return this.rigidBody.position[0];
	}
	/**
	*
	*/
	getY() {
		return this.rigidBody.position[1];
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
			this.goForward();
		}
		else if (this.pressingDown) {
			this.goBackward();
		}
	}
}
module.exports = Player;