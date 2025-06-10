# Test-Driven Development Framework for Multispace

This document describes how to create automated tests and debug features in the game by controlling both server and client.

## Server-Side Testing

### 1. Debug Mode Server
Create a test server instance with enhanced logging and control:

```javascript
// In server.js, add test mode
class TestServer extends Server {
    constructor() {
        super();
        this.testMode = true;
        this.testLogs = [];
    }
    
    // Override tick to add test logging
    tick() {
        super.tick();
        if (this.testMode) {
            this.logTestData();
        }
    }
    
    logTestData() {
        // Log trader states, positions, velocities
        this.traders.forEach((trader, i) => {
            const velocity = trader.rigidBody.velocity;
            const speed = Math.sqrt(velocity[0]**2 + velocity[1]**2);
            const log = {
                time: global.game.world.time,
                traderId: trader.id,
                position: [trader.getX(), trader.getY()],
                velocity: [velocity[0], velocity[1]],
                speed: speed,
                state: trader.state,
                target: trader.targetPlanet?.name,
                isThrusting: trader.isThrusting
            };
            this.testLogs.push(log);
        });
    }
    
    // Test assertions
    assertTradersMoving(timeWindow = 5) {
        const recentLogs = this.testLogs.filter(log => 
            log.time > global.game.world.time - timeWindow
        );
        
        const traderMovement = {};
        recentLogs.forEach(log => {
            if (!traderMovement[log.traderId]) {
                traderMovement[log.traderId] = {
                    positions: [],
                    speeds: []
                };
            }
            traderMovement[log.traderId].positions.push(log.position);
            traderMovement[log.traderId].speeds.push(log.speed);
        });
        
        // Check each trader moved
        Object.entries(traderMovement).forEach(([id, data]) => {
            const moved = this.hasPositionChanged(data.positions);
            const avgSpeed = data.speeds.reduce((a,b) => a+b, 0) / data.speeds.length;
            
            if (!moved || avgSpeed < 1) {
                console.error(`TRADER ${id} IS STUCK! Avg speed: ${avgSpeed}`);
                // Log detailed state for debugging
                const trader = this.traders.find(t => t.id === id);
                if (trader) {
                    console.log('Stuck trader details:', {
                        damping: trader.rigidBody.damping,
                        mass: trader.rigidBody.mass,
                        force: trader.rigidBody.force,
                        targetPlanet: trader.targetPlanet,
                        state: trader.state
                    });
                }
            }
        });
    }
    
    hasPositionChanged(positions) {
        if (positions.length < 2) return false;
        const first = positions[0];
        const last = positions[positions.length - 1];
        const distance = Math.sqrt((last[0]-first[0])**2 + (last[1]-first[1])**2);
        return distance > 5; // Must move at least 5 units
    }
}
```

### 2. Automated Client Connection
Create a headless client that can connect and observe:

```javascript
// test-client.js
const io = require('socket.io-client');

class TestClient {
    constructor(serverUrl = 'http://localhost:20001') {
        this.socket = io(serverUrl);
        this.gameState = {};
        this.setupListeners();
    }
    
    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Test client connected');
            this.login('TestBot');
        });
        
        this.socket.on('syncPositions', (data) => {
            this.gameState.entities = data;
            this.analyzeGameState();
        });
        
        this.socket.on('loginCompleted', (data) => {
            console.log('Test client logged in:', data);
            this.playerId = data.id;
        });
    }
    
    login(name) {
        this.socket.emit('login', { name });
    }
    
    analyzeGameState() {
        const traders = this.gameState.entities.filter(e => e.type === 'TRADER');
        traders.forEach(trader => {
            if (!this.traderHistory) this.traderHistory = {};
            if (!this.traderHistory[trader.id]) {
                this.traderHistory[trader.id] = [];
            }
            
            this.traderHistory[trader.id].push({
                time: Date.now(),
                x: trader.x,
                y: trader.y,
                state: trader.state
            });
            
            // Check if trader hasn't moved in last 10 updates
            const history = this.traderHistory[trader.id];
            if (history.length > 10) {
                const recent = history.slice(-10);
                const moved = this.hasMovementInHistory(recent);
                if (!moved) {
                    console.warn(`TRADER ${trader.id} appears stuck at (${trader.x}, ${trader.y})`);
                }
            }
        });
    }
    
    hasMovementInHistory(history) {
        const first = history[0];
        const last = history[history.length - 1];
        const distance = Math.sqrt((last.x-first.x)**2 + (last.y-first.y)**2);
        return distance > 10;
    }
    
    // Test actions
    moveToPosition(x, y) {
        // Calculate movement commands to reach position
        // Emit appropriate keyPress events
    }
    
    followTrader(traderId) {
        // Track and follow a specific trader
    }
}
```

### 3. Integration Test Runner
Combine server and client testing:

```javascript
// test-runner.js
async function runTraderMovementTest() {
    console.log('Starting trader movement test...');
    
    // Start test server
    const server = new TestServer();
    server.init();
    
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Connect test client
    const client = new TestClient();
    
    // Run test for 30 seconds
    const testDuration = 30000;
    const checkInterval = setInterval(() => {
        server.assertTradersMoving();
    }, 5000);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        console.log('Test complete. Analyzing results...');
        
        // Final analysis
        const stuckTraders = server.traders.filter(t => {
            const logs = server.testLogs.filter(l => l.traderId === t.id);
            if (logs.length < 2) return true;
            
            const firstPos = logs[0].position;
            const lastPos = logs[logs.length - 1].position;
            const distance = Math.sqrt(
                (lastPos[0]-firstPos[0])**2 + 
                (lastPos[1]-firstPos[1])**2
            );
            return distance < 50;
        });
        
        if (stuckTraders.length > 0) {
            console.error(`${stuckTraders.length} traders failed to move properly`);
            process.exit(1);
        } else {
            console.log('All traders moving correctly!');
            process.exit(0);
        }
    }, testDuration);
}
```

## Usage

1. **Run automated tests:**
   ```bash
   node test-runner.js
   ```

2. **Debug specific issues:**
   ```bash
   # Start server in debug mode
   DEBUG=true node server.js
   
   # In another terminal, run test client
   node test-client.js
   ```

3. **Manual testing with debug output:**
   - Set `process.env.PORT = 20002` to enable debug commands
   - Use commands: `traders`, `spawn`, `systems`, etc.

## Key Debug Points

1. **Physics initialization** - Verify rigidBody is added to world
2. **Force application** - Log when goForward() is called
3. **Velocity changes** - Track velocity before/after force application  
4. **AI decision making** - Log each step of updateAI()
5. **Collision detection** - Ensure traders aren't stuck on invisible obstacles

## Common Issues and Solutions

1. **Traders spawn but don't move**
   - Check damping values (should be low, like 0.1)
   - Verify thrust force is sufficient (at least 1000+)
   - Ensure updateAI() is being called each tick

2. **Traders move then stop**
   - Check if they're stuck in a state
   - Verify target selection logic
   - Look for velocity capping issues

3. **Inconsistent movement**
   - Check for physics world step issues
   - Verify no conflicting forces
   - Ensure proper state transitions