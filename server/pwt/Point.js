class Point {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
	/**
	*
	*/
	static distanceBetween(point) {
	    return Math.hypot(point.x - this.x, point.y - this.y);
	}
	/**
	*
	*/
	static distanceBetween(point1,point2) {
		var a = point2.x - point1.x;
		var b = point2.y - point1.y;
	    return Math.round(Math.sqrt(a * a + b * b));
	}
	
//----------------------------------------------------------------------------------------------------

	static radiansBetween(point1,point2) {
	    return Math.atan2(point2.y - point1.y,point2.x - point1.x);
	}
	static normalizeAngle(angle){
	    angle = angle % (2*Math.PI);
	    if(angle < 0){
	        angle += (2*Math.PI);
	    }
	    return angle;
	}
}
module.exports = Point;