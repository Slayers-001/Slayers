# Slayers — Advanced Edition

Slayers is now a polished, modular Three.js exploration game focused on stability, smooth controls, and production-style architecture.

## Major Upgrades

- **Player feel improvements**
  - Smooth acceleration/deceleration
  - Jump (`Space`), Sprint (`Shift`), Crouch (`C`)
  - Head bob + movement sway
  - Ground checks, wall collisions, landing shake
- **Visual polish**
  - Softer shadow setup
  - Balanced daylight/night cycle
  - Atmospheric fog depth
  - Animated dust particles + weather toggle (`R`)
- **Smart interaction**
  - Accurate center-raycast targeting
  - Hover highlight and click feedback
  - Sliding information panel + journal panel
- **Progression loop**
  - XP + leveling
  - Journal logging
  - Achievements
  - Quest tracker
- **Advanced quality features**
  - Mini-map (`M`)
  - Guide NPC
  - Hidden easter egg object
  - Admin panel (`P`) with password **Slayers**
    - Noclip
    - Speed control
    - Teleport dropdown
    - Day/night toggle
- **Settings panel (`O`)**
  - Sensitivity slider
  - Volume slider
  - Shadows toggle
  - FPS counter toggle
- **Credits retained in-game**
  - Owners: Utkarsh Pandey & Om Adhau

## Project Structure

- `src/main.js` — game orchestration + loop + input wiring
- `src/PlayerController.js` — movement and collision logic
- `src/MapManager.js` — world, environment, particles, teleports
- `src/InteractionSystem.js` — hover/interact raycasting
- `src/UIManager.js` — HUD, panels, toast, FPS
- `src/ProgressionSystem.js` — XP, levels, achievements, journal
- `src/QuestSystem.js` — quest objectives and UI status
- `src/AudioManager.js` — procedural sound cues

## Run Locally

```bash
npm install
npm run dev
```

Open the local Vite URL (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```
