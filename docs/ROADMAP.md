# Roadmap

## R0 — Browser playable (code complete, pending live acceptance)
- [x] Instant-play responsive browser UI
- [x] 3-lane auto-fire survival
- [x] Colored circle, square/diamond and hexagon enemies
- [x] 5 purchasable upgrades (power, rapid, split, pierce, blast)
- [x] Boost gates (damage, rate, split, credits, heal)
- [x] Combos, escalating waves, score and local personal best
- [x] GitHub repo + Cloudflare Worker Static Assets config
- [x] Node simulation tests and CI definition
- [ ] Verify CI check run passed
- [ ] Deploy and verify live Workers URL/health and browser gameplay
- [ ] Owner accepts gameplay on iPhone

## R1 — Fun and progression
- More enemy descriptors and boss waves; tune balancing through playtesting
- Weapon evolution choices, persistent cosmetic unlocks, audio and haptics
- Optional performance switch for low-end mobile devices
- Expanded test coverage for collision edge cases and performance

## R2 — Game portal
- Add /games/:slug registry and game discovery page
- Add more games while keeping Neon Lanes as the flagship
- Optional authenticated leaderboards via D1

## R3 — Multiplayer (later)
- Durable Object rooms + secure WebSockets
- Server-authoritative simulation and cheat-resistant submissions
- Matchmaking, reconnect, regional latency trials, abuse controls

## Source instructions
Original AC1: msg:6c432856-73ba-4758-b457-29a07c1892ef
Priority update: msg:033ce00a-359c-4aea-8ef9-7320b174eba7
