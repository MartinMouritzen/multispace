var p2 = require('p2');
var GameObject = require('./GameObject.js');

class Obstacle extends GameObject {
	/**
	 * Create a polygon obstacle in the game world
	 * @param {Array} vertices - Array of [x,y] points describing the polygon
	 * @param {Object} options - Additional options like color, name, etc.
	 */
	constructor(vertices, options = {}) {
		super(0, 0); // We'll calculate center later

		this.type = 'OBSTACLE';
		this.vertices = vertices;
		this.options = Object.assign({
			color: '#555555',
			name: 'Obstacle'
		}, options);

		// Create a convex shape from the vertices
		this.obstacleShape = new p2.Convex({ vertices: vertices });

		// Create a static body (mass=0) for the obstacle
		this.rigidBody = new p2.Body({
			mass: 0,  // Static body
			position: [0, 0]
		});

		this.rigidBody.gameObjectType = this.type;
		this.rigidBody.gameObject = this;

		// Add the shape to the body
		this.rigidBody.addShape(this.obstacleShape);
		
		// Set collision properties
		this.rigidBody.collisionGroup = global.game.OBSTACLE;
		this.rigidBody.collisionMask = global.game.SHIP;

		// Calculate the center of the polygon for rendering
		this.calculateCenter();
	}

	/**
	 * Calculate the center of the polygon
	 */
	calculateCenter() {
		let sumX = 0;
		let sumY = 0;

		for (let i = 0; i < this.vertices.length; i++) {
			sumX += this.vertices[i][0];
			sumY += this.vertices[i][1];
		}

		this.x = sumX / this.vertices.length;
		this.y = sumY / this.vertices.length;

		// Update the rigid body position to center
		this.rigidBody.position[0] = this.x;
		this.rigidBody.position[1] = this.y;
	}

	/**
	 * Get the X position of the obstacle
	 */
	getX() {
		return this.rigidBody.position[0];
	}

	/**
	 * Get the Y position of the obstacle
	 */
	getY() {
		return this.rigidBody.position[1];
	}
}

module.exports = Obstacle;