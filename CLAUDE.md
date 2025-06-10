# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
# Start the game server
npm start
# or
node server.js

# Development mode with auto-restart (Windows)
./run.bat
# Which runs: nodemon server.js
```

**Access the game:**
- Open browser at `http://localhost:20001`
- Default port: 20001

## Architecture Overview

This is a multiplayer 2D space game with authoritative server-side physics:

### Server Architecture (Node.js + Socket.io)
- **server.js**: Main entry point, game loop (25 FPS), manages connections
- **Physics**: Uses p2.js for 2D physics simulation
- **Game Objects Hierarchy**:
  - `GameObject` → Base class for all entities
  - `Ship` → Base for all ships (extends GameObject)
  - `Player` → User-controlled ships (extends Ship)
  - `AI` → Enemy ships with following behavior (extends Ship)
  - `Laser` → Projectiles (extends GameObject)
  - `Obstacle` → Static space objects (extends GameObject)

### Client Architecture (Vanilla JS + Canvas)
- **Client.js**: Entry point, initializes all systems
- **GameCanvas.js**: Handles all rendering (60 FPS)
- **Network.js**: Socket.io communication layer
- **Input.js**: Keyboard handling → server commands
- **Rendering Components**: Camera, Minimap, Chat

### Key Design Patterns
1. **Server-authoritative**: All physics/collision on server only
2. **Position broadcasting**: Server sends all positions at 25 FPS
3. **Input → Command**: Client sends commands, server validates/executes
4. **Collision groups**: Separate groups for players, AI, lasers

### Network Protocol
- **Client → Server**: movement commands, shoot commands, chat messages
- **Server → Client**: position updates, health updates, chat broadcasts
- Uses Socket.io for real-time bidirectional communication

## Important Implementation Notes

1. **Physics is server-only** - Never implement physics calculations client-side
2. **GameObject IDs** use UUID v4 for uniqueness
3. **Coordinate system**: Canvas rendering with camera following player
4. **AI behavior**: Simple follow-player logic with distance management
5. **Collision detection**: Handled by p2.js with custom collision handlers
6. **Chat system**: Sanitized with sanitize-html before broadcast

## Current Features
- Real-time multiplayer movement
- Combat system (lasers, health, shields)
- AI enemies
- Chat system
- Minimap
- Static obstacles
- Visual effects (jet exhaust, backgrounds)

## Common Tasks

**Adding a new game object type:**
1. Create server-side class extending GameObject or Ship
2. Add to server.js game loop and broadcasts
3. Create client-side rendering in GameCanvas.js
4. Handle any special networking needs in Network.js

**Modifying physics:**
- All physics changes go in server-side classes only
- Use p2.js API for physics bodies and constraints
- Update collision groups/masks as needed

**Adding new player actions:**
1. Add input handling in Input.js
2. Add socket event in server.js
3. Implement action logic server-side
4. Update client rendering if needed

## Testing & Debugging

**Test-Driven Development:**
- See `test-driven-development.md` for automated testing framework
- Can run both server and client tests programmatically
- Debug traders/AI: `DEBUG=true node server.js` or `PORT=20002 node server.js`
- Test client available for automated gameplay testing