var p2 = require('p2');
const uuidv1 = require('uuid/v1');

class Player {
	/**
	*
	*/
	constructor(socket) {
		this.x = 0;
		this.y = 0;
		
		this.angle = 0;
		
		this.id = socket.id;
		this.publicId = uuidv1();
		this.socket = socket;
		this.name = false;
		
		// Initiate physics
		this.shipTurnSpeed = 12;
		this.shipSize = 0.3;
		this.shipShape = new p2.Circle({ radius: this.shipSize });
		this.shipBody = new p2.Body({ mass: 1, position:[this.x,this.y], angularVelocity:1 });
		this.shipBody.damping = 0.8;
		this.shipBody.angularDamping = 0.8;
		this.shipBody.addShape(this.shipShape);

		this.pressingRight = false;
		this.pressingLeft = false;
		this.pressingUp = false;
		this.pressingDown = false;
	}
	increaseAngle() {
		this.shipBody.angularVelocity = -this.shipTurnSpeed;
	}
	/**
	*
	*/
	decreaseAngle() {
        this.shipBody.angularVelocity = this.shipTurnSpeed;
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
			this.shipBody.angularVelocity = 0;
		}

		if (this.pressingUp) {
			this.shipBody.applyForceLocal([0,-2400]);
		}
		
		if (this.pressingDown) {
			this.shipBody.applyForceLocal([0,600]);
		}
	}
}
module.exports = Player;