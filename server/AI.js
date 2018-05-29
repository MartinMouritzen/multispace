var Ship = require('./Ship.js');
var Point = require('./pwt/Point.js');

class AI extends Ship {
	/**
	*
	*/
	constructor(x,y) {
		super(x,y);
		this.type = 'PLAYER';
		this.rigidBody.angle = 0;
		this.rigidBody.gameObjectType = this.type;
		this.rigidBody.gameObject = this;
		
		this.action = 'idle';
		this.target = false;
		
		this.shootingRange = 400;
	}
	/**
	*
	*/
	updateAI() {
		var aiLocation = new Point(this.getX(),this.getY());
		if (this.target) {
			var targetLocation = new Point(this.target.getX(),this.target.getY());
			var radiansBetweenAIAndPlayer = Point.radiansBetween(targetLocation,aiLocation);
			
			var desiredAngle = Math.atan2(targetLocation.y - aiLocation.y, targetLocation.x - aiLocation.x)
			var desiredAngleDegrees = desiredAngle * 180 / Math.PI;
			
			this.dx = this.getX() - this.target.getX() ;
			this.dy = this.getY() - this.target.getY();
			this.distance = Math.sqrt((this.dx*this.dx) + (this.dy*this.dy));
			var desiredA = Math.atan2(this.dy,this.dx) * 180 / Math.PI;
			// this.rigidBody.angle = 0;
			
			this.rigidBody.angle = (desiredA - 90) * Math.PI / 180;
			
			// this.rigidBody.angle = Point.normalizeAngle(desiredA * Math.PI / 180);
			
			// console.log('desiredAngle: ' + desiredAngle + ':' + this.getAngle());
			// console.log('angleBetweenAIAndPlayer: ' + angleBetweenAIAndPlayer);

			// var angleToMove = 


			// var directionToMove = radiansBetweenAIAndPlayer - this.getAngle();
			/*
			if (directionToMove < 1) {
				this.increaseAngle();
			}
			else if (directionToMove > -1) {
				this.decreaseAngle();
			}
			*/
			
			
			/*
	        if (direction_move < 6) this.rotating = -1;
	        if (direction_move > -6) this.rotating = 1;
	
	        if (direction_move < 6 && direction_move > -6)
	        {
	            this.angle = direction;
	            this.rotating = 0;
	        }
	
	        if (distance > (_target.w / 2) + (this.w * 1.5) + 10) this.moving = 1;
	        else if (distance < (_target.w / 2) + (this.w * 1.5)) this.moving = -1;
	        else this.moving = 0;
	        */
		}
		else {
			var [nearestEnemy,nearestEnemyDistance] = this.getNearestEnemy();
			if (nearestEnemy) {
	            if (false && nearestEnemyDistance <= this.shootingRange) {
	            	
	            }
	            else {
	            	this.target = nearestEnemy;
	            	this.action = 'follow';
	            }
			}
		}
	}
	/**
	*
	*/
	getAngle() {
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
	getNearestEnemy() {
		var nearestEnemy = false;
		var nearestDistance = -1;
		var aiLocation = new Point(this.getX(),this.getY());
		for(var i in global.game.server.players) {
			var checkPlayer = global.game.server.players[i];
			if (!checkPlayer.active) {
				continue;
			}
			var checkPlayerLocation = new Point(checkPlayer.getX(),checkPlayer.getY());
			
			var distance = Point.distanceBetween(checkPlayerLocation,aiLocation);
			
			if (distance < nearestDistance || nearestDistance === -1) {
				nearestEnemy = checkPlayer;
				nearestDistance = distance;
			}
		}
		return [nearestEnemy,nearestDistance];
	}
}
module.exports = AI;