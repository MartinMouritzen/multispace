// Minimal server test to debug trader movement
var p2 = require('p2');
var Trader = require('./server/Trader.js');

// Set up minimal globals
global.game = {
    world: null,
    systemManager: {
        getSystem: function(systemId) {
            return {
                planets: [
                    { x: 100, y: 100, name: 'Test Planet' }
                ],
                starGates: []
            };
        }
    },
    server: {
        debugMode: true
    }
};

// Create world
var world = new p2.World({
    gravity: [0, 0]
});
world.defaultContactMaterial.friction = 0;
global.game.world = world;

// Create a trader
console.log('Creating trader...');
var trader = new Trader(500, 500);
trader.currentSystem = 'sol';

console.log('Trader created:', {
    id: trader.id,
    position: [trader.getX(), trader.getY()],
    damping: trader.rigidBody.damping,
    mass: trader.rigidBody.mass
});

// Add trader to world
world.addBody(trader.rigidBody);
console.log('Trader added to world. Bodies in world:', world.bodies.length);

// Simulate a few ticks
console.log('\nSimulating 10 ticks...');
for (let i = 0; i < 10; i++) {
    // Update AI
    trader.updateAI();
    
    // Step world
    world.step(1/25);
    
    // Log state
    var velocity = trader.rigidBody.velocity;
    var speed = Math.sqrt(velocity[0]**2 + velocity[1]**2);
    console.log(`Tick ${i+1}: pos=[${trader.getX().toFixed(0)}, ${trader.getY().toFixed(0)}], speed=${speed.toFixed(2)}, thrust=${trader.isThrusting}`);
}

// Check final state
console.log('\nFinal trader state:', {
    state: trader.state,
    target: trader.targetPlanet?.name,
    position: [trader.getX(), trader.getY()],
    velocity: [...trader.rigidBody.velocity]
});