# Slayers — Polished Edition

A modular Three.js 3D exploration game prototype focused on feel, polish, and stability.

## Features Included

- Smooth first-person controller with:
  - acceleration/deceleration
  - jump, sprint, crouch
  - head bob, camera sway
  - landing screen shake
  - ground + collision handling
- Smart interaction system:
  - center-raycast hover highlight
  - click feedback pulse + panel animation
- Progression systems:
  - XP + leveling
  - quests
  - journal
  - achievement popups
- Visual/audio polish:
  - soft shadows
  - depth fog
  - ambient dust particles
  - footstep/ui/ambient procedural sounds
- Tools and UX:
  - mini-map toggle (`M`)
  - settings panel (`O`): sensitivity, volume, shadows, FPS
  - admin panel (`P`) with password `Slayers`:
    - noclip
    - speed slider
    - teleport dropdown
    - day/night toggle
- Creative touches:
  - dynamic weather mode toggle (`R` for rainy/foggier ambiance)
  - credits shown in-game:
    - Owners: Utkarsh Pandey & Om Adhau

## Run

Because this project uses ES modules, run with a local static server.

Example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Controls

- **WASD**: Move
- **Space**: Jump
- **Shift**: Sprint
- **C**: Crouch
- **E**: Interact
- **J**: Journal
- **M**: Mini-map
- **O**: Settings
- **P**: Admin
- **R**: Weather toggle
