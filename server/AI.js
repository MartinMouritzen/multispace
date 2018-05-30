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
		this.rigidBody.angularVelocity = 0;
		
		this.action = 'idle';
		this.target = false;
		
		this.shootingRange = 400;
	}
	/**
	*
	*/
	updateAI() {
		var aiLocation = new Point(this.getX(),this.getY());
		if (this.target && this.target.active) {
			var targetLocation = new Point(this.target.getX(),this.target.getY());
			
			var radiansBetweenAIAndPlayer = Point.radiansBetween(aiLocation,targetLocation);
			var degreesBetweenAIAndPlayer = Math.round(radiansBetweenAIAndPlayer * 180 / Math.PI);
			/*
			
			
			
			var degreesBetweenAIAndPlayer = radiansBetweenAIAndPlayer * 180 / Math.PI;
			
			var currentAngleDegrees = (this.getAngle(true) * 180 / Math.PI);
			
			
			
			var desiredAngleDegrees = degreesBetweenAIAndPlayer - currentAngleDegrees;
			
			global.game.server.debug(Math.round(currentAngleDegrees) + ':' + Math.round(degreesBetweenAIAndPlayer) + ':' + Math.round(desiredAngleDegrees));
			*/
			
			var currentAngle = this.getAngle(true);
			if (currentAngle < 0) {
				currentAngle += 2*Math.PI;
			}
			if (radiansBetweenAIAndPlayer < 0) {
				radiansBetweenAIAndPlayer += 2*Math.PI;
			}
			
			var currentAngleDegrees = Math.round(currentAngle * 180 / Math.PI);
			
			var desiredAngleDegrees = 90 + degreesBetweenAIAndPlayer;
			
			var degreesToMoveToFaceEnemy = desiredAngleDegrees - currentAngleDegrees;

			// global.game.server.debug('degreesBetweenAIAndPlayer: ' + degreesBetweenAIAndPlayer + ' | currentAngleDegrees:' + currentAngleDegrees + ' | desiredAngleDegrees: ' + desiredAngleDegrees + ' | degreesToMoveToFaceEnemy: ' + degreesToMoveToFaceEnemy);

			/*
			if (degreesToMoveToFaceEnemy < -24) {
				this.increaseAngle();
			}
			else if (degreesToMoveToFaceEnemy > 24) {
				this.decreaseAngle();
			}
			else if (degreesToMoveToFaceEnemy < 24 && degreesToMoveToFaceEnemy > -24) {
				this.rigidBody.angle = desiredAngleDegrees * Math.PI / 180;
			}
			*/
			this.rigidBody.angle = desiredAngleDegrees * Math.PI / 180;

			var distance = this.getDistanceTo(this.target);
			if (distance > 300) {
				this.goForward();
				this.isThrusting = true;
				this.isReversing = false;
			}
			else if (distance <= 200) {
				this.goBackward();
				this.isThrusting = false;
				this.isReversing = true;
			}
			else {
				this.isThrusting = false;
				this.isReversing = false;
			}
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
	getAngle(normalized = false) {
		if (normalized) {
			var angle = this.rigidBody.angle % (2*Math.PI);
			if(angle < 0){
				angle += (2*Math.PI);
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
	getDistanceTo(gameObject) {
		var aiLocation = new Point(this.getX(),this.getY());
		var gameObjectLocation = new Point(gameObject.getX(),gameObject.getY());
		var distance = Point.distanceBetween(gameObjectLocation,aiLocation);
		return distance;
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