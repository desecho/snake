# Snake (TypeScript + HTML Canvas)

A browser-based Snake game built with Vite, TypeScript, and the HTML5 Canvas API.

## Requirements

- Node.js 18+ (Node 20+ recommended)
- npm

## Install

```bash
npm install
```

## Run the game

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Controls

- Arrow keys or `WASD`: Move
- `Space`: Pause / Resume
- `Enter` or `R`: Restart

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Type-check and create production build
- `npm run preview`: Preview the production build locally
- `npm run test`: Run unit tests once
- `npm run test:watch`: Run unit tests in watch mode

## Features

- Grid-based classic Snake gameplay
- Food spawn and snake growth
- Wall and self-collision game over
- Score + persistent high score (`localStorage`)
- Speed increases as score grows
- Canvas overlays for ready/paused/game-over states

## Project structure

```text
index.html
src/
  main.ts
  styles.css
  game/
    constants.ts
    engine.ts
    input.ts
    renderer.ts
    storage.ts
    types.ts
    __tests__/engine.test.ts
```
