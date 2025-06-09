var Planets = require('./Planets.js');

class SystemManager {
    constructor() {
        this.systems = {
            'sol': {
                name: 'Sol System',
                planets: [
                    { x: 100, y: 100, name: 'Aurelia', id: 'aurelia' },
                    { x: 2500, y: 1200, name: 'Nexus', id: 'nexus' },
                    { x: 1500, y: 2800, name: 'Frontier', id: 'frontier' }
                ],
                sun: { x: 3700, y: 3700, name: 'Sol' },
                starGates: [
                    { x: 4500, y: 4500, targetSystem: 'alpha', targetX: -700, targetY: -700 }  // Exit 200 units away from Alpha gate
                ]
            },
            'alpha': {
                name: 'Alpha Centauri',
                planets: [
                    { x: -1000, y: -1000, name: 'Nova Prime', id: 'nova_prime' },
                    { x: -3000, y: -2000, name: 'Cryos Station', id: 'ice_world' },
                    { x: -2000, y: -3500, name: 'Ferrox', id: 'mining_colony' }
                ],
                sun: { x: -2500, y: -2500, name: 'Alpha Centauri A' },
                starGates: [
                    { x: -500, y: -500, targetSystem: 'sol', targetX: 4300, targetY: 4300 },  // Exit 200 units away from Sol gate
                    { x: -4000, y: -4000, targetSystem: 'vega', targetX: 6300, targetY: 300 }  // Exit 200 units away from Vega gate
                ]
            },
            'vega': {
                name: 'Vega System',
                planets: [
                    { x: 6000, y: 1000, name: 'Shahara', id: 'desert_world' },
                    { x: 7500, y: 2000, name: 'Tempest', id: 'gas_giant' },
                    { x: 8000, y: 500, name: 'Einstein\'s Rest', id: 'research_station' }
                ],
                sun: { x: 7000, y: 1500, name: 'Vega' },
                starGates: [
                    { x: 6500, y: 500, targetSystem: 'alpha', targetX: -3800, targetY: -3800 }  // Exit 200 units away from Alpha gate
                ]
            }
        };
        
        this.currentSystem = 'sol'; // Default starting system
    }
    
    getSystem(systemId) {
        return this.systems[systemId];
    }
    
    getCurrentSystem() {
        return this.systems[this.currentSystem];
    }
    
    getAllPlanets() {
        var allPlanets = [];
        for (var systemId in this.systems) {
            var system = this.systems[systemId];
            for (var planet of system.planets) {
                allPlanets.push({
                    ...planet,
                    system: systemId
                });
            }
        }
        return allPlanets;
    }
    
    getNearbyPlanets(x, y, maxDistance = 5000) {
        var nearbyPlanets = [];
        var currentSystem = this.getCurrentSystem();
        
        for (var planet of currentSystem.planets) {
            var dx = planet.x - x;
            var dy = planet.y - y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= maxDistance) {
                nearbyPlanets.push(planet);
            }
        }
        
        return nearbyPlanets;
    }
    
    getStarGatesInSystem(systemId) {
        var system = this.systems[systemId];
        return system ? system.starGates : [];
    }
}

module.exports = SystemManager;