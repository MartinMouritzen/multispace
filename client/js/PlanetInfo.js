class PlanetInfo {
    static planets = {
        'aurelia': {
            name: 'Aurelia',
            type: 'Earth-like World',
            atmosphere: 'Breathable',
            population: '2.3 billion',
            description: 'A lush paradise with vast oceans and green continents. First successful human colony outside Earth.'
        },
        'nexus': {
            name: 'Nexus', 
            type: 'Desert Mining World',
            atmosphere: 'Thin - Breathing apparatus required',
            population: '450 million',
            description: 'Rich in Nexium crystals essential for FTL drives. Underground cities protect from massive sandstorms.'
        },
        'frontier': {
            name: 'Frontier',
            type: 'Frontier Outpost',
            atmosphere: 'Marginal - Domed cities',
            population: '78 million', 
            description: 'Last stop before Alpha Centauri. A lawless world of prospectors and outlaws.'
        }
    };
    
    static getPlanetInfo(planetName) {
        const key = planetName.toLowerCase().replace(/\s+/g, '_');
        return this.planets[key] || null;
    }
    
    static renderPlanetTooltip(context, planet, x, y, playerDistance) {
        // Only show detailed info when close to planet
        if (playerDistance > 500) return;
        
        const info = this.getPlanetInfo(planet.name);
        if (!info) return;
        
        const alpha = Math.max(0, 1 - (playerDistance / 500));
        
        context.save();
        context.globalAlpha = alpha;
        
        // Background box
        const boxWidth = 300;
        const boxHeight = 100;
        const boxX = x - boxWidth / 2;
        const boxY = y + 40;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        context.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Planet info text
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        
        context.fillText(info.type, x, boxY + 20);
        context.font = '12px Arial';
        context.fillText(`Population: ${info.population}`, x, boxY + 40);
        context.fillText(info.atmosphere, x, boxY + 60);
        
        // Description
        context.font = '11px Arial';
        context.fillStyle = '#cccccc';
        const words = info.description.split(' ');
        let line = '';
        let lineY = boxY + 80;
        
        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = context.measureText(testLine);
            if (metrics.width > boxWidth - 20 && line.length > 0) {
                context.fillText(line, x, lineY);
                line = word + ' ';
                lineY += 15;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, lineY);
        
        context.restore();
    }
}