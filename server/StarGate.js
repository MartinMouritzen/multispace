var GameObject = require('./GameObject.js');
var p2 = require('p2');

class StarGate extends GameObject {
    constructor(x, y, targetSystem, targetX, targetY) {
        super(x, y);
        this.type = 'STARGATE';
        
        // Star gate properties
        this.targetSystem = targetSystem;
        this.targetX = targetX;
        this.targetY = targetY;
        this.radius = 100;
        this.cooldowns = {}; // Track cooldowns per object to prevent instant re-teleport
        
        // Create physics body
        this.gateShape = new p2.Circle({ radius: this.radius });
        this.gateShape.sensor = true; // Make it a sensor (no physical collision)
        
        this.rigidBody = new p2.Body({
            mass: 0, // Static body
            position: [this.x, this.y],
            type: p2.Body.STATIC
        });
        
        this.rigidBody.addShape(this.gateShape);
        this.rigidBody.gameObjectType = this.type;
        this.rigidBody.gameObject = this;
        
        // Set collision masks so ships can detect star gates
        this.rigidBody.collisionGroup = global.game.STARGATE;
        this.rigidBody.collisionMask = global.game.SHIP;
    }
    
    getX() {
        return this.rigidBody.position[0];
    }
    
    getY() {
        return this.rigidBody.position[1];
    }
    
    canTeleport(objectId) {
        if (!this.cooldowns[objectId]) return true;
        return global.game.world.time - this.cooldowns[objectId] > 3; // 3 second cooldown
    }
    
    setCooldown(objectId) {
        this.cooldowns[objectId] = global.game.world.time;
    }
    
    // Clean up old cooldowns periodically
    cleanupCooldowns() {
        var currentTime = global.game.world.time;
        for (var id in this.cooldowns) {
            if (currentTime - this.cooldowns[id] > 10) {
                delete this.cooldowns[id];
            }
        }
    }
}

module.exports = StarGate;