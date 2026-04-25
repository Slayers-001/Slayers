# Slayers — Competition Edition (Multiplayer)

Slayers now includes a larger map, stronger GUI polish, many more discoverable items, and the multiplayer stack (WebSocket server + synced remote avatars). Controls and interaction reliability were also fixed for competition stability.

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
  - Interaction fallback messaging when no object is in range
  - Discovery counter (`Relics found/total`)
  - Online player counter
  - Upgraded objective panel + journal styling
- **Multiplayer kept**
  - Real-time room-based player sync
  - Remote avatars with labels and interpolation
- **Systems retained**
  - Player movement polish, collisions, jump/sprint/crouch
  - Controls are corrected (W forward, S backward, A/D strafe)
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

```bash
npm install
npm run dev:all
```

- Client: `http://localhost:5173`
- WS server: `ws://localhost:8080`

## Credits

Owners: Utkarsh Pandey & Om Adhau
