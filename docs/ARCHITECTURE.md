# Neon Lanes Architecture

## Four boundaries
1. Simulation: public/sim.js uses seeded RNG and game state. tick(game,dt) handles waves, enemy spawning, shooting, hits, upgrades, gates, damage, score and loss. No DOM or network dependency.
2. Presentation: public/game.js uses Canvas 2D perspective projection; controls, visual effects, HUD and local best record. It consumes events from the simulation and never independently awards scores.
3. Assets: public/ is browser-native and plays without required backend requests.
4. Edge: worker/index.js serves /api/health only, with Cloudflare Static Assets handling game files.

## Future extensibility
Shape/enemy type definitions can become a registry independent of rendering assets, allowing WebGL/Three.js instanced meshes or sprites without replacing game mechanics. Add content as new wave and archetype data first.

Multiplayer: introduce normalized input intents (move, purchase, fire) over WebSockets; a Durable Object owns one match, authoritative simulation/ticks and bounded snapshots. Clients only predict/interpolate. D1 for leaderboards/accounts where needed, KV optionally for cache. Never trust local client scores for ranked online use.

## Limitations and privacy
Single-player and local-authoritative. Local best scores are not anti-cheat secure. No cloud accounts, leaderboard, production deployment claim, multiplayer or mandatory tracking. Sound defaults off; anonymous play works immediately.
