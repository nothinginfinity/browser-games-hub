# Neon Lanes architecture

## Source of truth
Repository: nothinginfinity/browser-games-hub
Primary game: Neon Lanes (first release).

### Layers
- `public/sim.js`: deterministic rules/physics, lane selection, procedural spawning, enemy HP, waves, scores, credits, purchases. No DOM or Canvas imports.
- `public/game.js`: Canvas2D pseudo-3D road, polygons/spheres, effects, input, accessibility, UI, local personal best.
- `public/index.html`, `public/style.css`: single page interface.
- `worker/index.js`: Cloudflare Worker /api/health and Static Assets forwarding. API isolated from rules.
- `tests/sim.test.mjs`: standalone Node.js simulations, no browser required.

### Expansion seams
1. Enemy catalog: replace `spawnEnemy` type selection with versioned enemy descriptors. Keep canonical collision/health separate from draw models.
2. New game routes: add a portal route and individual game modules without changing this game loop.
3. Multiplayer (not implemented): Durable Object as authoritative per-room simulation; inputs as small JSON commands over authenticated WebSockets; client predicts player movement and renders server snapshots. Validate rate limits and never trust score or purchases from the browser.
4. Persistence (not implemented): future D1 for accounts/high scores; KV cache where safe; localStorage for current solo personal best only.
5. Monetization: not implemented; avoid pay-to-win defaults.

### Deployment safety
The repository contains one opt-in deployment controller (Actions if scoped secrets are present, otherwise Cloudflare Workers Builds) to prevent duplicate deploys. Validate the live URL and `/api/health` before declaring production ready.
