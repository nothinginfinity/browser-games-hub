# Neon Lanes architecture

## Source of truth
Repository: nothinginfinity/browser-games-hub
Primary game: Neon Lanes, the first browser arcade game. Deployed R0 source SHA `5773d7cd2453a8002b201aaefb3a392be7c17c1e`.

### Shipped R0 layers
- `public/sim.js`: deterministic rules/physics, lane selection, procedural spawning, enemy HP, waves, scores, credits, purchases. No DOM or Canvas imports.
- `public/game.js`: Canvas2D pseudo-3D road, polygons/spheres, effects, input, accessibility, UI, local personal best.
- `public/index.html`, `public/style.css`: single page interface.
- `worker/index.js`: Cloudflare Worker `/api/health` and Static Assets forwarding. API isolated from rules.
- `tests/sim.test.mjs`: standalone Node.js simulations, no browser required.

### Existing expansion seams
1. Enemy catalog: replace `spawnEnemy` type selection with versioned enemy descriptors. Keep canonical collision/health separate from draw models.
2. New game routes: add a portal route and individual game modules without changing this game loop.
3. Multiplayer (not implemented): Durable Object as authoritative per-room simulation; inputs as small JSON commands over authenticated WebSockets; client predicts player movement and renders server snapshots. Validate rate limits and never trust score or purchases from the browser.
4. Persistence (not implemented): future D1 for accounts/high scores; KV cache where safe; localStorage for current solo personal best only.
5. Monetization: not implemented; avoid pay-to-win defaults.

## Proposed architecture: interoperable linked levels and attacker play
**Status: proposal, NOT built.** See [ADR-0001](ADR-0001-LEVEL-PORTALS-AND-ATTACKER-MODE.md).

```
Player / iPhone
  -> Portal UI -> Verified LevelManifest Registry -> Level Runtime
     |                |                            |
     |                + creatorId / ruleVersion     + renderer / sim / roles
     |
     + Progression Passport Exchange (future Worker API)
          + short-lived one-time destination-bound ticket
          + authority-verified progression receipt (future D1)
          + clear competitive versus locally-unverified state

Attacker UI -> validated spawn/deploy command queue -> Shared deterministic sim
Defender UI -> movement/purchase inputs ------------> Shared deterministic sim
                                                       |
                                      Local replay challenge (first)
                                                       |
                                      Durable Object room (later PvP)
```

### Contract boundaries
- `RunSnapshotV1`: same-origin, local/unverified progress for early prototypes.
- `LevelManifestV1`: versioned creator, rules, assets, loadout/score compatibility and safe navigation targets.
- `ProgressionPassportV1`: signed/verified claim and one-time ticket exchange for trusted cross-level transfer. Never treat a link's score or browser localStorage as competitive authority.
- `EnemyDescriptorV1`: unit identity, cost, cooldown, health, speed, behavioral rules and render asset alias.
- `AttackPlanV1`: immutable versioned/seeded enemy deployment timeline, validation receipt and room/rules references.
- Future Durable Object: authoritative tick, role permissions, attacker energy/budget and defender movement/weapon controls. No browser-minted enemy health, money or match results.

### Cross-creator security
Third-party creator content stays in isolation/sandboxed origins. Declarative validated level/asset manifests precede scripting plugins. Where cross-origin progress is permitted, use bounded redemptions, signature/issuer checks, explicit destination/version, replay protection, origin verification and opt-in disclosures. Ranked play should normalize equipment when cross-level progression would destroy fairness.

### Deployment safety
The repository has Cloudflare deployment GitHub Actions and health/HTML smoke acceptance; GitHub code changes and roadmapped capabilities are not equivalent to production acceptance. Preserve Level 1 at `/` and ship new level routes behind testable opt-in entrypoints. Validate actual live URL and `/api/health` for production readiness.
