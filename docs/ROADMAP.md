# Roadmap — Neon Lanes and Browser Games Hub

> State recorded 2026-10-20. Level 1 is live and owner-tested ("it worked", "pretty good", appropriate Level 1). Level portals, portable score passports and attacker play are **planned**, not shipped.
> Design decision: [ADR-0001: Level portals and attacker/defender play](ADR-0001-LEVEL-PORTALS-AND-ATTACKER-MODE.md).

## R0 — Neon Lanes, playable Level 1 (deployed and owner-tested)
- [x] Instant-play responsive browser UI and three-lane auto-fire defense
- [x] Colored geometric enemies and escalating waves
- [x] Five purchasable upgrades: power, rapid, split, pierce, blast
- [x] Boost gates, combo, credits, survival score, local personal best
- [x] GitHub repo, Worker Static Assets, deterministic simulation and automated tests
- [x] CI syntax and simulation checks: Actions `39439919730`
- [x] Cloudflare deploy, health and HTML smoke: Actions `39439919392`
- [x] Owner confirms game works and likes it as Level 1 (2026-10-20)
- [ ] Optional deeper iPhone balance/accessibility/performance review

## R1 — Linked levels and portable progression (IN REVIEW: branch chatgpt/r1-curated-level-portals; pending CI/owner acceptance)
- [ ] Versioned LevelManifest/creator descriptors, curated level registry
- [ ] Add second small level with independent difficulty/weapon presets
- [ ] Explicit portal link from Level 1 to Level 2 and return/back path
- [ ] RunSnapshotV1: preserve career score, level score, compatible loadout and credits across *same-origin* navigation
- [ ] Validate/cap upgrades according to destination declared rules; recover from malformed/stale snapshots
- [ ] Label local progress as unverified; do not trust query-string scores for rankings
- [ ] Unit and integration checks + iPhone owner acceptance

## R1b — Verified creator interoperability
- [ ] ProgressionPassportV1 / one-time short-lived level handoff ticket from trusted Worker
- [ ] Score distinction: career vs chapter vs level, explicit rules across portals
- [ ] Bound receipt to run, destination, level version and expiration; reject replay and forged scores
- [ ] Separate trusted account/profile storage and allowlisted, sandboxed external creators
- [ ] Signed/versioned creator manifests, compatible weapon item descriptors, transparent item conversion
- [ ] Consentful progress sharing and recovery; end-to-end cross-origin test before claiming interop

## R2 — Attacker Lab (new core game mode)
- [ ] Attacker can choose and deploy colored enemy types/formations/lanes
- [ ] Resource budget, spawn cooldowns, active enemy caps and limited round length
- [ ] Deterministic command rules/replay seeds shared with the defender simulation
- [ ] AI/recorded defender target; both sides have explicit win conditions
- [ ] Enemy descriptors and weapon/effect catalog support creator expansions
- [ ] Balance telemetry and tests for illegal spawns/exploits

## R2b — Creator attack challenges / asynchronous competition
- [ ] Build/publish immutable attack plans and share challenge links
- [ ] Defender can accept a recorded attacker-authored siege, then view outcome
- [ ] Validate attack plan budget, timing and level-version compatibility
- [ ] Reproducible seeded replay, anti-cheat verified scoring and optional leaderboards

## R3 — Live asymmetric multiplayer
- [ ] Durable Object room-authoritative tick loop over secure WebSockets
- [ ] One player defends core, one attacks with energy-limited enemy deployment
- [ ] Matchmaking/invites, reconnect, ordering, anti-spam limits and fairness metrics
- [ ] Two-device live iPhone acceptance, disconnection/rejoin and result verification

## R4 — Creator level network and multi-game portal
- [ ] Creator toolkits/templates for levels, geometries, weapons, enemies and rule packages
- [ ] Versioned publishing and curated discovery of third-party levels
- [ ] Strict isolation of untrusted creator assets/code from hub origin
- [ ] Additional games and community level links; Neon Lanes remains the flagship
- [ ] Cosmetic unlocks, bosses, audio/haptics, mobile performance options
- [ ] Any creator economy or payment layer separately reviewed for fraud, permissions and moderation

## Source instructions
- Original request: `msg:6c432856-73ba-4758-b457-29a07c1892ef`
- Priority Level 1 game: `msg:033ce00a-359c-4aea-8ef9-7320b174eba7`
- Owner expansion request: this conversation 2026-10-20; acceptance of initial game plus linked levels and attacker-controlled enemy deployment.

Next **functional implementation** to review/build: a second curated mini-level + same-origin score-carrying portal, then attacker lab. Do not deploy these roadmap ideas until separately implemented and tested.
