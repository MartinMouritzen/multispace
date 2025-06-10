var GameObject = require('./GameObject.js');

class SpaceStation extends GameObject {
    constructor(planetX, planetY, planetName) {
        // Planet center offset (planets are 400px max width, so radius is ~200)
        var planetCenterX = planetX + 200;
        var planetCenterY = planetY + 200;
        
        // Start at a random angle around the planet
        var angle = Math.random() * Math.PI * 2;
        var orbitRadius = 320; // 120 units outside planet edge (200 planet radius + 120)
        
        var x = planetCenterX + Math.cos(angle) * orbitRadius;
        var y = planetCenterY + Math.sin(angle) * orbitRadius;
        
        super(x, y);
        
        this.type = 'SPACESTATION';
        this.planetCenterX = planetCenterX;
        this.planetCenterY = planetCenterY;
        this.planetName = planetName;
        this.orbitRadius = orbitRadius;
        this.orbitSpeed = 0.02; // Radians per second (much slower)
        this.currentAngle = angle;
        this.rotationSpeed = 0.1; // Station's own rotation (slower)
        this.angle = 0;
        
        // No physics body needed - we'll update position manually
    }
    
    update(deltaTime) {
        // Update orbital position
        this.currentAngle += this.orbitSpeed * deltaTime;
        if (this.currentAngle > Math.PI * 2) {
            this.currentAngle -= Math.PI * 2;
        }
        
        // Calculate new position around planet center
        this.x = this.planetCenterX + Math.cos(this.currentAngle) * this.orbitRadius;
        this.y = this.planetCenterY + Math.sin(this.currentAngle) * this.orbitRadius;
        
        // Update station rotation
        this.angle += this.rotationSpeed * deltaTime;
        if (this.angle > Math.PI * 2) {
            this.angle -= Math.PI * 2;
        }
    }
    
    getX() {
        return this.x;
    }
    
    getY() {
        return this.y;
    }
}

module.exports = SpaceStation;