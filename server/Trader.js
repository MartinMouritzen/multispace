var Ship = require('./Ship.js');
var Point = require('./pwt/Point.js');
const uuidv1 = require('uuid/v1');

class Trader extends Ship {
    constructor(x, y) {
        super(x, y);
        this.id = uuidv1(); // Ensure unique ID
        this.type = 'TRADER';
        this.rigidBody.angle = 0;
        this.rigidBody.gameObjectType = this.type;
        this.rigidBody.gameObject = this;
        this.rigidBody.angularVelocity = 0;
        
        // Reduce damping for traders to allow better movement
        this.rigidBody.damping = 0.1; // Further reduced from 0.3 for better movement
        this.rigidBody.angularDamping = 0.3; // Reduced from 0.5
        
        // Override collision settings - traders should pass through other ships
        this.rigidBody.collisionMask = global.game.OBSTACLE | global.game.STARGATE; // Remove LASER collision
        this.rigidBody.collisionGroup = global.game.SHIP;
        
        // Trader-specific properties
        this.state = 'flying'; // flying, landing, landed, departing
        this.targetPlanet = null;
        this.currentPlanet = null;
        this.landingDistance = 300; // Distance to planet to start slowing down
        this.departureTime = null;
        this.landingDuration = 10; // seconds on planet
        this.maxSpeed = 250; // Maximum speed for traders (increased for better movement)
        this.slowdownDistance = 500; // Distance to start gradual slowdown
        
        // System awareness
        this.currentSystem = 'sol'; // Default starting system
        
        // Will be updated dynamically based on current system
        this.planets = [];
        
        // Don't select destination in constructor - wait for first update
        this.needsDestination = true;
        
        // Slower movement for traders
        this.shipTurnSpeed = 8;
    }
    
    selectRandomDestination() {
        // Safety check for system manager
        if (!global.game || !global.game.systemManager) {
            console.log('Trader: No system manager available');
            return;
        }
        
        // Get planets in current system
        var system = global.game.systemManager.getSystem(this.currentSystem);
        if (!system) {
            // Default to sol system
            this.currentSystem = 'sol';
            system = global.game.systemManager.getSystem(this.currentSystem);
            if (!system) return;
        }
        
        this.planets = system.planets;
        
        // Make sure we have planets
        if (!this.planets || this.planets.length === 0) {
            return;
        }
        
        // 30% chance to go to another system via star gate
        if (Math.random() < 0.3 && system.starGates && system.starGates.length > 0) {
            var starGate = system.starGates[Math.floor(Math.random() * system.starGates.length)];
            this.targetPlanet = {
                x: starGate.x,
                y: starGate.y,
                name: 'Star Gate to ' + starGate.targetSystem,
                isStarGate: true
            };
        } else {
            // Choose a regular planet
            var availablePlanets = this.planets.filter(p => p !== this.currentPlanet);
            if (availablePlanets.length === 0) {
                // If no other planets available, just pick any planet
                availablePlanets = this.planets;
            }
            
            if (availablePlanets.length > 0) {
                this.targetPlanet = availablePlanets[Math.floor(Math.random() * availablePlanets.length)];
            }
        }
        
    }
    
    updateAI() {
        // Check if we need to select initial destination
        if (this.needsDestination || !this.targetPlanet) {
            this.selectRandomDestination();
            this.needsDestination = false;
            
            // If still no target after trying, select a fallback destination
            if (!this.targetPlanet) {
                // Try to get first planet in current system
                var system = global.game.systemManager.getSystem(this.currentSystem);
                if (system && system.planets && system.planets.length > 0) {
                    this.targetPlanet = system.planets[0];
                    console.log(`Trader ${this.id.substring(0,8)}: Using fallback to ${this.targetPlanet.name}`);
                } else {
                    // Ultimate fallback - go to Aurelia in Sol
                    this.targetPlanet = {
                        x: 100,
                        y: 100,
                        name: 'Aurelia',
                        id: 'aurelia',
                        isStarGate: false
                    };
                    console.log(`Trader ${this.id.substring(0,8)}: Using ultimate fallback to Aurelia`);
                }
            }
            
            // Debug first target selection only in debug mode
            if (global.game.server && global.game.server.debugMode) {
                console.log(`Trader ${this.id.substring(0,8)} selected target: ${this.targetPlanet.name}`);
            }
        }
        
        if (this.state === 'flying') {
            this.updateFlying();
        } else if (this.state === 'landing') {
            this.updateLanding();
        } else if (this.state === 'landed') {
            this.updateLanded();
        } else if (this.state === 'departing') {
            this.updateDeparting();
        }
    }
    
    updateFlying() {
        if (!this.targetPlanet) return;
        
        var traderLocation = new Point(this.getX(), this.getY());
        var targetLocation = new Point(this.targetPlanet.x, this.targetPlanet.y);
        
        var distance = Point.distanceBetween(traderLocation, targetLocation);
        
        // Check if trader is stuck (very low velocity)
        var velocity = this.rigidBody.velocity;
        var currentSpeed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
        
        // Debug log for stuck traders only
        if (global.game.server && global.game.server.debugMode) {
            if (!this.updateCount) this.updateCount = 0;
            this.updateCount++;
            
            // Only log if stuck
            if (currentSpeed < 5 && distance > 100 && this.updateCount > 10) {
                console.log(`STUCK Trader ${this.id.substring(0,8)}: speed=${currentSpeed.toFixed(2)}, distance=${distance.toFixed(0)}`);
            }
        }
        
        if (currentSpeed < 5 && distance > 100) {
            // Give a small push to get unstuck
            this.rigidBody.applyForceLocal([0, -2000]);
            // Also ensure the body is awake
            this.rigidBody.sleepState = 0; // AWAKE
        }
        
        // Check if close enough to start landing
        if (distance <= this.landingDistance) {
            // If it's a star gate, don't land, just keep flying into it
            if (this.targetPlanet.isStarGate) {
                // Just keep normal flying behavior - collision will handle teleport
                // Don't do special handling that might cause getting stuck
            } else {
                this.state = 'landing';
                this.currentPlanet = this.targetPlanet;
                return;
            }
        }
        
        // Navigate toward target planet
        var radiansBetweenTraderAndTarget = Point.radiansBetween(traderLocation, targetLocation);
        var currentAngle = this.getAngle(true);
        
        if (currentAngle < 0) {
            currentAngle += 2 * Math.PI;
        }
        if (radiansBetweenTraderAndTarget < 0) {
            radiansBetweenTraderAndTarget += 2 * Math.PI;
        }
        
        var desiredAngle = radiansBetweenTraderAndTarget + Math.PI / 2;
        this.rigidBody.angle = desiredAngle;
        
        // Ensure angle is properly set
        this.rigidBody.angularVelocity = 0; // Stop any rotation
        
        // Gradual slowdown as we approach the planet
        if (distance < this.slowdownDistance) {
            // Calculate thrust based on distance (closer = less thrust)
            var thrustScale = Math.max(0.2, distance / this.slowdownDistance);
            
            // Check current speed
            var velocity = this.rigidBody.velocity;
            var currentSpeed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
            
            // Only thrust if we're going slow enough for the distance
            var targetSpeed = this.maxSpeed * thrustScale;
            
            if (currentSpeed < targetSpeed) {
                this.goForward();
                this.isThrusting = true;
            } else {
                // Let friction slow us down
                this.isThrusting = false;
            }
        } else {
            // Full speed when far from planets
            this.goForward();
            this.isThrusting = true;
        }
        
        this.isReversing = false;
        
        // Apply speed limits
        this.updateVelocity();
    }
    
    updateLanding() {
        // Slow down and move toward planet center
        this.isThrusting = false;
        this.isReversing = false;
        
        var traderLocation = new Point(this.getX(), this.getY());
        var planetLocation = new Point(this.currentPlanet.x, this.currentPlanet.y);
        var distance = Point.distanceBetween(traderLocation, planetLocation);
        
        // Apply braking force to slow down
        var velocity = this.rigidBody.velocity;
        var speed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
        
        if (speed > 20) {
            // Apply force opposite to velocity to brake
            var brakeForce = 800;
            var brakeX = -velocity[0] / speed * brakeForce;
            var brakeY = -velocity[1] / speed * brakeForce;
            this.rigidBody.applyForce([brakeX, brakeY]);
        }
        
        // If moving too slow and still far, give a small push toward planet
        if (speed < 10 && distance > 100) {
            var radiansToPlanet = Point.radiansBetween(traderLocation, planetLocation);
            var pushForce = 300;
            var pushX = Math.cos(radiansToPlanet) * pushForce;
            var pushY = Math.sin(radiansToPlanet) * pushForce;
            this.rigidBody.applyForce([pushX, pushY]);
        }
        
        // If very close to planet, land
        if (distance <= 80) {
            this.state = 'landed';
            this.departureTime = global.game.world.time + this.landingDuration;
            this.isThrusting = false;
            this.isReversing = false;
            // Move ship to planet surface (invisible)
            this.rigidBody.position[0] = this.currentPlanet.x;
            this.rigidBody.position[1] = this.currentPlanet.y;
            this.rigidBody.velocity[0] = 0;
            this.rigidBody.velocity[1] = 0;
        }
        
        // Safety check - if stuck in landing for too long, abort
        if (!this.landingStartTime) {
            this.landingStartTime = global.game.world.time;
        }
        if (global.game.world.time - this.landingStartTime > 10) {
            // Abort landing, go back to flying
            this.state = 'flying';
            this.landingStartTime = null;
            this.selectRandomDestination();
        }
    }
    
    updateLanded() {
        // Stay landed until departure time
        if (global.game.world.time >= this.departureTime) {
            this.state = 'departing';
            this.selectRandomDestination();
        }
    }
    
    updateDeparting() {
        // Move away from planet and resume flying
        var traderLocation = new Point(this.getX(), this.getY());
        var planetLocation = new Point(this.currentPlanet.x, this.currentPlanet.y);
        var distance = Point.distanceBetween(traderLocation, planetLocation);
        
        if (distance >= this.landingDistance) {
            this.state = 'flying';
            this.currentPlanet = null;
            this.landingStartTime = null; // Reset landing timer
        } else {
            // Move away from planet
            var radiansBetweenTraderAndPlanet = Point.radiansBetween(traderLocation, planetLocation);
            var desiredAngle = radiansBetweenTraderAndPlanet + Math.PI + Math.PI / 2;
            this.rigidBody.angle = desiredAngle;
            
            this.goForward();
            this.isThrusting = true;
            this.isReversing = false;
        }
    }
    
    getAngle(normalized = false) {
        if (normalized) {
            var angle = this.rigidBody.angle % (2 * Math.PI);
            if (angle < 0) {
                angle += (2 * Math.PI);
            }
            return angle;
        }
        return this.rigidBody.angle;
    }
    
    getX() {
        return this.rigidBody.position[0];
    }
    
    getY() {
        return this.rigidBody.position[1];
    }
    
    // Traders should not be targeted by hostile AI
    isHostile() {
        return false;
    }
    
    // Override goForward to use reduced thrust
    goForward() {
        // Use 1/2 of normal thrust for traders (was 1/4 which was too weak)
        this.rigidBody.applyForceLocal([0, -1200]);
        
        // Ensure body is awake
        if (this.rigidBody.sleepState === 2) { // p2.Body.SLEEPING
            this.rigidBody.sleepState = 0; // p2.Body.AWAKE
        }
    }
    
    // Override to apply speed limits
    updateVelocity() {
        var velocity = this.rigidBody.velocity;
        var speed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
        
        if (speed > this.maxSpeed) {
            var scale = this.maxSpeed / speed;
            this.rigidBody.velocity[0] *= scale;
            this.rigidBody.velocity[1] *= scale;
        }
    }
}

module.exports = Trader;