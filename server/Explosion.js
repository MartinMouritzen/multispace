var GameObject = require('./GameObject.js');

class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.type = 'EXPLOSION';
        
        // Explosion properties
        this.particles = [];
        this.particleCount = 12;
        this.maxLifetime = 1.0; // seconds
        this.startTime = global.game.world.time;
        
        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                angle: (Math.PI * 2 / this.particleCount) * i,
                speed: 100 + Math.random() * 200,
                size: 2 + Math.random() * 4,
                lifetime: 0.5 + Math.random() * 0.5
            });
        }
        
        // Set die time
        this.dieTime = this.startTime + this.maxLifetime;
    }
    
    getX() {
        return this.x;
    }
    
    getY() {
        return this.y;
    }
    
    getParticleData() {
        var currentTime = global.game.world.time;
        var elapsedTime = currentTime - this.startTime;
        
        var activeParticles = [];
        
        for (let particle of this.particles) {
            if (elapsedTime < particle.lifetime) {
                var progress = elapsedTime / particle.lifetime;
                var currentX = this.x + Math.cos(particle.angle) * particle.speed * elapsedTime;
                var currentY = this.y + Math.sin(particle.angle) * particle.speed * elapsedTime;
                var currentSize = particle.size * (1 - progress);
                var alpha = 1 - progress;
                
                activeParticles.push({
                    x: currentX,
                    y: currentY,
                    size: currentSize,
                    alpha: alpha
                });
            }
        }
        
        return activeParticles;
    }
}

module.exports = Explosion;