# Yamal Bovanenkovo Construction Simulator

Browser-based first-person 3D walking simulation of an arctic industrial construction environment inspired by Yamal / Bovanenkovo.

## Features

- Large map with central construction site, modular camp, pipeline storage and distant tundra.
- First-person controls (WASD, mouse look, Shift sprint, Space jump) via Pointer Lock.
- Arctic terrain with procedural height variation and cold lighting.
- Dynamic environment: day/dusk switch (`T`) and automatic cycle.
- Snow weather states: light snow, clear visibility, snow mist.
- Construction equipment made from primitives: bulldozers, dump trucks, crawler crane, pipelayer, ATVs.
- Industrial details: floodlights, containers, roads, fences, utility clusters.
- Rare arctic wildlife in distant tundra: foxes and very rare polar bears.
- HUD with coordinates, controls, weather and zone detection.

## Run

1. Open `index.html` directly in a modern browser (Chrome/Edge/Firefox).
2. Click `Начать`.
3. Grant pointer lock by interacting with the page.
4. Walk through zones:
   - Camp and HQ (negative X, positive Z)
   - Construction core (center)
   - Pipe storage (positive X)
   - Empty tundra (far radius)

## Controls

- `W A S D` — move
- `Mouse` — look
- `Shift` — sprint
- `Space` — jump
- `T` — toggle day/dusk mode
- `Esc` — unlock cursor and show start overlay
