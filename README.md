# Slayers — Competition Edition (Multiplayer)

Slayers now includes a larger map, stronger GUI polish, many more discoverable items, and the multiplayer stack (WebSocket server + synced remote avatars).

## What Was Upgraded

- **Map quality + world density**
  - Expanded playable zone layout: Museum Hall, Park Plaza, Market Lane
  - New hub props: fountain, benches, trees, lamps
  - Better zone readability + teleports
- **More game items**
  - 15+ collectible relics/artifacts/nature/market objects
  - Rarity tagging in info panel
  - Discovery progression tied to larger collectible pool
- **GUI/HUD improvements**
  - Cleaner visual style and stronger readability
  - Discovery counter (`Relics found/total`)
  - Online player counter
  - Upgraded objective panel + journal styling
- **Multiplayer kept**
  - Real-time room-based player sync
  - Remote avatars with labels and interpolation
- **Systems retained**
  - Player movement polish, collisions, jump/sprint/crouch
  - XP, levels, quests, achievements, journal, weather, admin/settings

## Multiplayer Files

- `server/index.js` — room authority + player state snapshots
- `src/MultiplayerClient.js` — client netcode and remote players

## Core Runtime Files

- `src/main.js` — orchestration and loop
- `src/MapManager.js` — world geometry, props, collectibles, colliders
- `src/UIManager.js` + `src/styles.css` + `index.html` — GUI/HUD
- `src/PlayerController.js` — movement and collision
- `src/ProgressionSystem.js` / `src/QuestSystem.js` — progression and objectives

## Run
# Slayers — Advanced Edition (Multiplayer)

Slayers now supports real-time multiplayer sessions over WebSockets while keeping all previous polish systems: movement feel, progression, quests, weather, NPC guidance, and admin tooling.

## Multiplayer Added

- Real-time player sync through a dedicated Node WebSocket server.
- Room-based sessions (`room-code` field on start screen).
- Player name labels above remote avatars.
- Interpolated movement for smooth remote motion.
- Non-blocking fallback: if server is unavailable, single-player still runs.

## Existing Polished Systems

- Smooth movement with jump/sprint/crouch, collision, landing shake
- Interaction, questing, XP/leveling, journal, achievements
- Dynamic weather + day/night controls
- Admin panel (`P`) password: **Slayers**
- Settings panel (`O`) for sensitivity, volume, shadows, FPS
- Mini-map, compass, and save persistence

## Files Added for Multiplayer

- `server/index.js` — multiplayer websocket authority + room snapshots
- `src/MultiplayerClient.js` — browser realtime netcode and remote avatars

## Run (Client + Multiplayer Server)

```bash
npm install
npm run dev:all
```

- Client: `http://localhost:5173`
- WS server: `ws://localhost:8080`
- Vite client: `http://localhost:5173`
- Multiplayer WS server: `ws://localhost:8080`

## Run Separately

```bash
npm run dev
npm run dev:server
```

## Build

```bash
npm run build
npm run preview
```

## Credits

Owners: Utkarsh Pandey & Om Adhau
#Slayers
