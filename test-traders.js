// Test script to debug trader movement
const p2 = require('p2');

// Create a simple physics world
const world = new p2.World({
    gravity: [0, 0]
});

// Create a test body like a trader
const body = new p2.Body({
    mass: 1,
    position: [0, 0],
    damping: 0.1,
    angularDamping: 0.3
});

const shape = new p2.Circle({ radius: 30 });
body.addShape(shape);
world.addBody(body);

console.log('Initial state:');
console.log('  Position:', body.position);
console.log('  Velocity:', body.velocity);
console.log('  Damping:', body.damping);

// Apply force like the trader does
body.applyForceLocal([0, -1200]);

console.log('\nAfter applying force:');
console.log('  Force:', body.force);

// Step the world
for (let i = 0; i < 10; i++) {
    world.step(1/25);
    const speed = Math.sqrt(body.velocity[0]**2 + body.velocity[1]**2);
    console.log(`Step ${i+1}: pos=[${body.position[0].toFixed(2)}, ${body.position[1].toFixed(2)}], vel=[${body.velocity[0].toFixed(2)}, ${body.velocity[1].toFixed(2)}], speed=${speed.toFixed(2)}`);
}

// Test with different damping values
console.log('\n\nTesting different damping values:');
[0.8, 0.3, 0.1, 0.01].forEach(damping => {
    const testBody = new p2.Body({
        mass: 1,
        position: [0, 0],
        damping: damping
    });
    testBody.addShape(new p2.Circle({ radius: 30 }));
    
    // Apply same force
    testBody.applyForceLocal([0, -1200]);
    
    // Single step
    testBody.integrate(1/25);
    
    const speed = Math.sqrt(testBody.velocity[0]**2 + testBody.velocity[1]**2);
    console.log(`Damping ${damping}: speed after 1 step = ${speed.toFixed(4)}`);
});