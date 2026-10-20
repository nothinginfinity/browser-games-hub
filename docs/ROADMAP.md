# Browser Games Hub Roadmap

## R0 — Neon Lanes as PRIMARY launch game
- [x] Public repository and touch-first original geometric lane shooter
- [x] Auto fire, three lanes, wave scaling, shields, scoring and combos
- [x] Credits, five weapon upgrades and bonus gates
- [x] Split simulation/rendering, Cloudflare Worker and asset configuration
- [x] Automated simulation checks and CI/deployment workflows in source
- [ ] Verify latest main CI checks
- [ ] Configure Cloudflare token or Workers Builds Git integration
- [ ] Verify deployment URL, health response and assets
- [ ] Owner iPhone gameplay acceptance and balancing

## R1 — Gameplay polish
- [ ] Bosses, enemy variations, better particles, sound and haptics
- [ ] Balancing, level milestones, achievements, skins
- [ ] Tutorial, accessibility and persist/resume versioned runs

## R2 — Game platform
- [ ] Hub with game catalog and per-game routes
- [ ] Shared UI components and optional authenticated leaderboard
- [ ] Add new games without refactoring Neon Lanes

## R3 — Multiplayer
- [ ] Durable Object match owner and authoritative game ticks
- [ ] WebSocket rooms/invites, reconnect and reconciliation
- [ ] Security, score integrity, rate limiting and load testing

GitHub passing checks is NOT proof of live Cloudflare deployment. Live and phone acceptance remain separate gates.
