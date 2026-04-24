# Slayers — Advanced Edition

Slayers is a polished, modular Three.js exploration game focused on stability, smooth controls, persistence, and clean extensibility.

## Major Systems

- **Player feel upgrades**
  - Smooth acceleration/deceleration
  - Jump (`Space`), Sprint (`Shift`), Crouch (`C`)
  - Head bob, camera sway, landing impact shake
  - Ground checks + wall collision resolution
- **World polish**
  - Tuned lighting and fog depth
  - Dust particles + dynamic rain/lightning weather
  - Day/night toggle
  - Guide NPC + easter egg object
- **Interaction + progression**
  - Accurate center raycast interaction
  - Hover feedback and click response
  - XP, levels, achievements, quests, journal
- **Advanced UX**
  - Mini-map (`M`)
  - Compass indicator
  - Slide-in info and journal panels
  - Save indicator and auto-persistence
- **Admin and settings**
  - Admin panel (`P`) password: **Slayers**
  - Noclip, speed slider, teleport dropdown, day/night toggle
  - Settings (`O`) for sensitivity, volume, shadows, FPS

## New Files Added for Expansion

- `src/SaveSystem.js` — local persistence for settings/progression/quests/weather state.
- `src/WeatherSystem.js` — rain particles + lightning flashes.
- `src/NPCDialogueSystem.js` — guide NPC dialogue rotation and hint flow.

## Project Structure

- `src/main.js` — orchestration, game loop, save scheduling, controls
- `src/PlayerController.js` — movement + collision
- `src/MapManager.js` — scene/world/teleports/interactables
- `src/InteractionSystem.js` — raycasting and interaction callbacks
- `src/ProgressionSystem.js` — XP, achievements, discovery tracking
- `src/QuestSystem.js` — objective progression and rendering
- `src/UIManager.js` — HUD, panels, toasts, compass, save indicator
- `src/AudioManager.js` — procedural SFX
- `src/styles.css` — UI styling

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Credits

Owners: Utkarsh Pandey & Om Adhau
