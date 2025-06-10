// Trader debugging script
// Run this alongside your server to get detailed trader diagnostics

const io = require('socket.io-client');

class TraderDebugger {
    constructor() {
        this.socket = io('http://localhost:20001');
        this.traders = {};
        this.stuckTraders = new Set();
        
        this.setupSocketListeners();
        
        // Report every 5 seconds
        setInterval(() => this.reportStatus(), 5000);
    }
    
    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Debug client connected');
            this.socket.emit('login', { name: 'TraderDebugger' });
        });
        
        this.socket.on('syncPositions', (data) => {
            const currentTime = Date.now();
            
            // Process each entity
            data.forEach(entity => {
                if (entity.type === 'TRADER') {
                    if (!this.traders[entity.id]) {
                        this.traders[entity.id] = {
                            positions: [],
                            states: [],
                            firstSeen: currentTime
                        };
                    }
                    
                    const trader = this.traders[entity.id];
                    trader.positions.push({ x: entity.x, y: entity.y, time: currentTime });
                    trader.states.push(entity.state);
                    trader.lastSeen = currentTime;
                    trader.isThrusting = entity.isThrusting;
                    
                    // Keep only last 50 positions
                    if (trader.positions.length > 50) {
                        trader.positions.shift();
                        trader.states.shift();
                    }
                }
            });
        });
    }
    
    reportStatus() {
        console.log('\n=== TRADER DEBUG REPORT ===');
        console.log(`Time: ${new Date().toLocaleTimeString()}`);
        console.log(`Total traders tracked: ${Object.keys(this.traders).length}`);
        
        let movingCount = 0;
        let stuckCount = 0;
        let landedCount = 0;
        
        Object.entries(this.traders).forEach(([id, trader]) => {
            const movement = this.calculateMovement(trader);
            const lastState = trader.states[trader.states.length - 1];
            
            if (lastState === 'landed') {
                landedCount++;
            } else if (movement.totalDistance < 10 && movement.samples > 5) {
                stuckCount++;
                this.stuckTraders.add(id);
                console.log(`\nSTUCK TRADER ${id}:`);
                console.log(`  Position: (${movement.lastPos.x.toFixed(0)}, ${movement.lastPos.y.toFixed(0)})`);
                console.log(`  Total movement in ${movement.timeSpan}ms: ${movement.totalDistance.toFixed(1)} units`);
                console.log(`  Average speed: ${movement.avgSpeed.toFixed(2)} units/sec`);
                console.log(`  State: ${lastState}`);
                console.log(`  Thrusting: ${trader.isThrusting}`);
            } else {
                movingCount++;
                this.stuckTraders.delete(id);
            }
        });
        
        console.log(`\nSummary: ${movingCount} moving, ${stuckCount} stuck, ${landedCount} landed`);
        
        if (this.stuckTraders.size > 0) {
            console.log('\nSTUCK TRADER IDs:', Array.from(this.stuckTraders).join(', '));
        }
    }
    
    calculateMovement(trader) {
        if (trader.positions.length < 2) {
            return { totalDistance: 0, avgSpeed: 0, samples: 0, timeSpan: 0 };
        }
        
        let totalDistance = 0;
        const positions = trader.positions.slice(-10); // Last 10 positions
        
        for (let i = 1; i < positions.length; i++) {
            const dx = positions[i].x - positions[i-1].x;
            const dy = positions[i].y - positions[i-1].y;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
        
        const timeSpan = positions[positions.length - 1].time - positions[0].time;
        const avgSpeed = timeSpan > 0 ? (totalDistance / timeSpan) * 1000 : 0;
        
        return {
            totalDistance,
            avgSpeed,
            samples: positions.length,
            timeSpan,
            lastPos: positions[positions.length - 1]
        };
    }
}

// Start the debugger
const traderDebugger = new TraderDebugger();
console.log('Trader debugger started. Monitoring traders...');