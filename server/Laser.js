var p2 = require('p2');
var GameObject = require('./GameObject.js');

class Laser extends GameObject {
	/**
	*
	*/
	constructor(x,y,angle,ship) {
		super();
		
		var laserAngle = angle + Math.PI / 2;
		
		// console.log(angle);
		x = (ship.shipShape.radius - 70) * Math.cos(laserAngle) + ship.rigidBody.position[0],
		y = (ship.shipShape.radius - 70) * Math.sin(laserAngle) + ship.rigidBody.position[1]
		
		// console.log(Math.round(ship.rigidBody.position[0],2) + ':' + Math.round(ship.rigidBody.position[1],2) + ' - ' + Math.round(x,2) + ':' + Math.round(y,2));
		
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.type = 'LASER';
		
		var magnitude = 5;
		
		this.dieTime = global.game.world.time + 2;
		
		this.laserSize = 0.1;
		this.laserShape = new p2.Circle({ radius: this.laserSize });

		this.rigidBody = new p2.Body({ mass: 0.05, position:[this.x,this.y] });
		this.rigidBody.type = this.type;
		this.rigidBody.gameObject = this;
		
		this.rigidBody.collisionMask = global.game.SHIP;
		this.rigidBody.collisionGroup = global.game.LASER;
		
		this.rigidBody.damping = 0;
		this.rigidBody.collisionResponse = false;
		this.rigidBody.angularDamping = 0;
		this.rigidBody.addShape(this.laserShape);
		this.rigidBody.angle = angle;
		this.rigidBody.applyForceLocal([0,-4400]);
		// 2 * Math.cos(angle) + shipBody.velocity[0],
		// 2 * Math.sin(angle) + shipBody.velocity[1]
		// this.rigidBody.velocity[0] += ship.rigidBody.velocity[0];
		// this.rigidBody.velocity[1] += ship.rigidBody.velocity[1];
		// this.rigidBody.velocity[0] = 100;
		// this.rigidBody.velocity[1] = 100;
	}
}
module.exports = Laser;