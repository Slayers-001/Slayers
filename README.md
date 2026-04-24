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
