# Roadmap — Neon Lanes and Browser Games Hub

> Acceptance state (2026-10-20): R0 Level 1 and R1 curated Level 2 portals are **shipped, deployed, and owner iPhone-tested (5/5)**. Progress transfers are **same-origin and local/unverified only**. R1b trusted creator passports and R2 attacker play remain **planned**, not shipped.
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

## R1 — Linked levels and portable progression (SHIPPED; owner iPhone acceptance PASS 5/5 on 2026-10-20)
- [x] Versioned LevelManifest descriptors and curated local level registry
- [x] Level 2 Overdrive at `/levels/002/` with distinct difficulty and destination upgrade limits
- [x] Explicit Level 1 → Level 2 and return portal links
- [x] RunSnapshotV1: preserve career score, credits and owned weapons across *same-origin* navigation; reset level score on level change
- [x] Apply destination compatibility caps without deleting owned upgrades; recover valid saved progress from malformed/stale portal tickets
- [x] Local progress labeled unverified; score never transferred in a URL query string
- [x] GitHub automated progression/simulation checks and owner iPhone portal/progression acceptance (5/5)
- [x] PR #1 merged at `9520baeb46238c282de1b9d9d17f799c9c1e2cde`; validate `39445763485` and Cloudflare deploy `39445763275` succeeded
- [x] Owner checked: Level 1 upgrade; portal to Level 2; career score/credits/owned weapons persist while level score resets; harder Level 2 and return portal; progress survives returning and refreshing
- [ ] Optional deeper accessibility, performance and invalid/expired/replayed portal-ticket iPhone exploration (covered by automated tests, not separately owner-tested)

## R1b — Verified creator interoperability
- [ ] ProgressionPassportV1 / one-time short-lived level handoff ticket from trusted Worker
- [ ] Score distinction: career vs chapter vs level, explicit rules across portals
- [ ] Bound receipt to run, destination, level version and expiration; reject replay and forged scores
- [ ] Separate trusted account/profile storage and allowlisted, sandboxed external creators
- [ ] Signed/versioned creator manifests, compatible weapon item descriptors, transparent item conversion
- [ ] Consentful progress sharing and recovery; end-to-end cross-origin test before claiming interop

## R2 — Attacker Lab (SLICE A CANDIDATE: branch chatgpt/r2-attacker-lab-slice-a, NOT MERGED / NOT DEPLOYED)
- [x] Candidate: standalone `/attacker-lab/` local attacker role with selection of three colored enemy types and three target lanes
- [x] Candidate: finite energy/refill, unit cooldowns, active enemy cap, spawn quota and 60-second match
- [x] Candidate: deterministic fixed-step command rules, seed and local replay (shares the R1 defender combat engine)
- [x] Candidate: auto-targeting defender, explicit attacker/core-breach and defender/survival victory conditions
- [x] Candidate: fixed validated scout/raider/bruiser descriptors; separate local counters and invalid/overspending command tests
- [ ] Independent review, CI, live route/asset smoke and owner iPhone acceptance before marking shipped
- [ ] Formation editor, balance tuning/telemetry depth, content extension and replay-export UX remain subsequent R2 work

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

Next **functional implementation**: R2 Attacker Lab, built and reviewed separately from the accepted R1 levels. Begin with budget-limited attacker-controlled enemy deployment against a deterministic AI/recorded defender; add asynchronous challenges and live PvP only in later gated milestones. Do not conflate local-unverified progress with trusted competitive scoring.
