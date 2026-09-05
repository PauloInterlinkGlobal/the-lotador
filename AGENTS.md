# LOTADOR — Base44 Dev Environment

## Overview
Pure frontend Vite + React + TypeScript 3D arcade game (Three.js). No backend, no database, no server-side code. Uses Bun lockfile but npm works for dev.

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Web service: `node:22-slim`, runs `npm install` then `npm run dev` (Vite on port 3000, host 0.0.0.0).
- Source is bind-mounted at `/app`; `node_modules` is a named volume to persist installed deps.
- File watching uses polling (`CHOKIDAR_USEPOLLING=true`) for reliable hot reload under bind mounts.

## Secrets
None required. The `.env.example` references `GEMINI_API_KEY` / `APP_URL`, but the source code does not use them. The app boots and runs fully without any external credentials.

## Verifying
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the app HTML.
- Preview should show the LOTADOR main menu.

## Notes
- The app sets `overflow: hidden` and `touch-action: none` on body — it's a game UI, not a scrollable page.
- Game state persists in `localStorage` (keys `LOTADOR_SAVE_V1`, `LOTADOR_SETTINGS_V1`).
