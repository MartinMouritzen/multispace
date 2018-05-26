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
}
module.exports = GameObject;