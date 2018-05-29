class GameObject {
	/**
	*
	*/
	constructor(x,y) {
		this.x = x;
		this.y = y;
		
		this.angle = 0;
		
		this.type = 'unknown';
	}
	/**
	*
	*/
	getAngle() {
		return 0;
	}
	/**
	*
	*/
	getX() {
		return this.x;
	}
	/**
	*
	*/
	getY() {
		return this.y;
	}
}
module.exports = GameObject;