class Planets {
    static getAllPlanets() {
        return {
            // Sol System
            'aurelia': {
                id: 'aurelia',
                name: 'Aurelia',
                system: 'sol',
                position: { x: 100, y: 100 },
                image: 'planet2.png', // Earth-like
                type: 'terran',
                description: 'A lush Earth-like world with vast oceans and green continents.',
                history: 'First colony established in 2157. Aurelia was humanity\'s first successful terraforming project outside Earth. The planet\'s twin moons create spectacular tidal phenomena, making it a hub for marine research. Its capital, New Geneva, houses the Interstellar Trade Commission.',
                population: '2.3 billion',
                exports: ['Food', 'Biotechnology', 'Luxury goods'],
                atmosphere: 'Breathable'
            },
            'nexus': {
                id: 'nexus',
                name: 'Nexus',
                system: 'sol',
                position: { x: 2500, y: 1200 },
                image: 'planet3.png', // Desert
                type: 'desert',
                description: 'A harsh desert world rich in rare minerals and crystals.',
                history: 'Discovered in 2189, Nexus was initially deemed uninhabitable. However, the discovery of Nexium crystals - essential for FTL drives - transformed it into a mining boomtown. The planet\'s underground cities are marvels of engineering, protecting inhabitants from sandstorms that can last months.',
                population: '450 million',
                exports: ['Nexium Crystals', 'Rare metals', 'Solar energy'],
                atmosphere: 'Thin, requires breathing apparatus'
            },
            'frontier': {
                id: 'frontier',
                name: 'Frontier',
                system: 'sol',
                position: { x: 1500, y: 2800 },
                image: 'aurelia.png', // Original image
                type: 'frontier',
                description: 'A wild, untamed world on the edge of human space.',
                history: 'Frontier serves as the last refueling station before the jump to Alpha Centauri. Established in 2234, it\'s a lawless world where prospectors, outlaws, and fortune seekers gather. The planet\'s unique magnetic field creates aurora displays visible even during daylight.',
                population: '78 million',
                exports: ['Ship fuel', 'Weapons', 'Black market goods'],
                atmosphere: 'Marginal, domed cities required'
            },
            
            // Alpha Centauri System
            'nova_prime': {
                id: 'nova_prime',
                name: 'Nova Prime',
                system: 'alpha',
                position: { x: -1000, y: -1000 },
                image: 'planet4.png', // Water world
                type: 'oceanic',
                description: 'An ocean world with floating cities and underwater colonies.',
                history: 'Nova Prime\'s endless oceans hide ancient alien ruins discovered in 2267. The Cetari - dolphin-like aliens - were the first sentient species humanity encountered. Now, human and Cetari cities coexist, with the planet serving as a center for xenobiology research and interspecies diplomacy.',
                population: '890 million (Human), 2 billion (Cetari)',
                exports: ['Seafood', 'Alien artifacts', 'Medical compounds'],
                atmosphere: 'Dense, humid but breathable'
            },
            'ice_world': {
                id: 'ice_world',
                name: 'Cryos Station',
                system: 'alpha',
                position: { x: -3000, y: -2000 },
                image: 'aurelia.png', // Reuse for now
                type: 'ice',
                description: 'A frozen world with subsurface oceans heated by volcanic activity.',
                history: 'Originally designated "Ice World," Cryos Station was established in 2298 as a research outpost. Scientists discovered thermophilic bacteria in the subsurface oceans that produce natural antifreeze compounds now used in spacecraft. The planet\'s ice caves contain preserved specimens of extinct alien life.',
                population: '12 million',
                exports: ['Cryogenic compounds', 'Research data', 'Ice sculptures'],
                atmosphere: 'Toxic, extreme cold'
            },
            'mining_colony': {
                id: 'mining_colony',
                name: 'Ferrox',
                system: 'alpha',
                position: { x: -2000, y: -3500 },
                image: 'planet3.png', // Desert/mining world
                type: 'industrial',
                description: 'A heavily industrialized mining world stripped of natural beauty.',
                history: 'Ferrox represents both humanity\'s industrial might and its environmental failures. Once a garden world, two centuries of unregulated mining have left it barren. The Ferrox Accord of 2341 established new environmental protections for other worlds. Despite its scars, Ferrox remains the galaxy\'s primary source of starship hull materials.',
                population: '340 million',
                exports: ['Durasteel', 'Industrial equipment', 'Processed ore'],
                atmosphere: 'Polluted, filtration required'
            },
            
            // Vega System
            'desert_world': {
                id: 'desert_world',
                name: 'Shahara',
                system: 'vega',
                position: { x: 6000, y: 1000 },
                image: 'planet3.png', // Desert
                type: 'desert',
                description: 'A desert world with ancient pyramid structures of unknown origin.',
                history: 'Shahara\'s massive pyramid complexes predate any known civilization by millions of years. The structures generate a low-level energy field that makes the harsh desert surprisingly habitable. Archaeological teams from across human space compete to unlock their secrets. Some believe they\'re beacons for a long-lost alien empire.',
                population: '67 million',
                exports: ['Archaeological artifacts', 'Tourism', 'Spice'],
                atmosphere: 'Dry but breathable'
            },
            'gas_giant': {
                id: 'gas_giant',
                name: 'Tempest',
                system: 'vega',
                position: { x: 7500, y: 2000 },
                image: 'planet4.png', // Use water world image for gas giant
                type: 'gas_giant',
                description: 'A massive gas giant with floating mining platforms in its upper atmosphere.',
                history: 'Tempest\'s violent storms produce naturally occurring plasma that\'s harvested for weapons and energy systems. The floating city of Cloudholm, suspended in the calmer equatorial zone, is considered one of the most beautiful human settlements. Storm-riders, daredevils who surf the planet\'s atmospheric currents, have made it an extreme sports destination.',
                population: '23 million',
                exports: ['Plasma', 'Rare gases', 'Energy cells'],
                atmosphere: 'None (floating platforms have artificial atmosphere)'
            },
            'research_station': {
                id: 'research_station',
                name: 'Einstein\'s Rest',
                system: 'vega',
                position: { x: 8000, y: 500 },
                image: 'planet2.png', // Earth-like for research
                type: 'research',
                description: 'A carefully maintained world dedicated to scientific research.',
                history: 'Einstein\'s Rest was established in 2312 as a neutral ground for scientific collaboration. The planet\'s charter prohibits military presence and commercial exploitation. Home to the Galactic University and numerous research institutes, it\'s where humanity\'s greatest minds work on everything from FTL improvements to first contact protocols.',
                population: '156 million',
                exports: ['Scientific data', 'Advanced technology', 'Educated specialists'],
                atmosphere: 'Perfectly regulated'
            }
        };
    }
    
    static getPlanet(planetId) {
        const planets = this.getAllPlanets();
        return planets[planetId];
    }
    
    static getPlanetsInSystem(systemId) {
        const planets = this.getAllPlanets();
        return Object.values(planets).filter(planet => planet.system === systemId);
    }
    
    static getRandomPlanetDescription(planetId) {
        const planet = this.getPlanet(planetId);
        if (!planet) return null;
        
        const descriptions = [
            `${planet.name} - Population: ${planet.population}`,
            `${planet.name} exports: ${planet.exports.join(', ')}`,
            `${planet.name} - ${planet.atmosphere} atmosphere`,
            planet.description
        ];
        
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }
}

module.exports = Planets;