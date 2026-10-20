# ADR-0001 — Connected level portals and asymmetric attacker/defender play

- Status: **roadmap decision / architecture proposal; NOT implemented**
- Date: 2026-10-20
- Project: Neon Lanes (flagship of Browser Games Hub)
- Owner feedback: Level 1 was tested on iPhone and works; owner considers it a promising Level 1.
- Origin: operator conversation 2026-10-20. This is a plan, not a claim that level transitions or PvP already exist.
- Current R0 source: commit `5773d7cd2453a8002b201aaefb3a392be7c17c1e`; canonical checkpoint `97abf8b81a75fb45862280fa01f2f7cac416de1d366a247e54f2950ab78ca1f3`.

## Opportunity

Reframe Neon Lanes as a **connected creator-driven level network** with one interoperable gameplay vocabulary. Each creator may publish a level/encounter/weapon pack; players choose a portal link at a level boundary and take compatible progress to the destination. Support two roles using the same deterministic simulation:
- **Defender**: pilot/upgrade weapon systems and protect the core, as in Level 1.
- **Attacker**: compose and deploy purchased enemy formations to breach another player's core subject to energy, cooldown, active-unit, spawn-lane and round-duration limits.

These ideas reinforce one another: portals allow user-authored worlds and upgrade ecosystems, while attacker challenges give creators and players reasons to publish/share those levels. Preserve Level 1 as a stable fallback/entrypoint.

## Product contract: levels are linked worlds, not monolithic stages

- `levelId`: immutable slug/id; `version`: immutable published ruleset version; `creatorId`: pseudonymous publisher; `entryUrl`: canonical HTTPS portal; `rulesetId`, `manifestVersion`, `assetPack`, `difficulty`, `allowedItems`, `scorePolicy` and `verificationPolicy`.
- Level directory lists trusted/approved publisher levels first; opt-in unverified community levels are distinguished visually and cannot issue trusted competitive progress.
- A completion/exit screen presents explicit links to available destinations; do not force navigation or redirect without player intent.
- Progress is a **passport envelope**, not query-string `?score=1000000`. Suggested fields: `passportVersion`, `runId`, `playerId` (anonymous pseudonym or account identifier), `fromLevelId`, `toLevelId`, `fromLevelVersion`, `score`, `currency`, `loadout`, `unlockIds`, `ruleVersion`, `issuedAt`, `expiresAt`, `nonce`, `receiptId`, `verification`.
- Explicit **two-ledger semantics**: total/career score stays cumulative and read-only for trust; level-local score resets or follows each level's declared policy. Currency and weapon inventory transfer only according to destination's declared compatibility and budget caps.
- In the early, same-origin solo prototype, a locally stored run snapshot + `levelId` link can preserve score/loadout across pages; label these as unverified local progress. Do not use user-editable localStorage or URL parameters as authoritative competitive scores.
- Cross-origin creator levels must redeem an opaque, short-lived **one-time handoff ticket** against a trusted platform exchange or equivalent server-verified signed receipt. The URL carries the ticket identifier, never a secret bearer wallet/key or the full score payload. Bind ticket to destination/version and consume once. Limit replay, expiration, redirect targets and level-manifest tampering.
- A level on a creator's own origin must not execute untrusted JavaScript inside the platform's privileged origin. Use isolated hosting / sandboxed iframe + strict `postMessage` origin and schema checks when embedding, or external verified navigation with explicitly bounded capabilities. Explicitly disclose what progress is shared.
- Item compatibility: weapons have portable `itemId`/version descriptors and declared balance tiers. A receiving level may cap, adapt or escrow incompatible upgrades with clear UI. Avoid universal permanent overpowered items.
- Creator package publication: declarative and validated manifests first (spawn patterns, enemy/weapon descriptors, visuals and rules presets). Do not start with arbitrary third-party script execution on shared privileged infrastructure.
- Level 1 remains available at `/`. Proposed versioned path: `/levels/001`, `/levels/:levelId` or creator-distributed verified URL. Neither path exists until implemented.

## Product contract: attacker control / adversarial play

### Phase A — attacker laboratory (single player, local)
An attacker panel composes waves against an AI/recorded defensive loadout:
- Choose enemy types, lane, formation, timing and limited upgrades.
- Each action costs a **threat/energy budget** earned per tick or granted per round, plus per-unit cooldown. Spawn commands are deterministic and validated by the same game rules that process defender shots.
- Enemy type descriptors replace ad hoc conditional spawning, so creators may add visually distinct units without changing combat semantics. Every type has health, speed, size, movement patterns, cost, cooldown and caps.
- Round fairness constraints: fixed clock, win conditions (breach core vs survive duration), costs, spawn quotas, no unavoidable instant spawn at the core. Expose telemetry to tune defender versus attacker win rates.
- Seeded randomness adds variety, but the seed and attacker command order are preserved for reproducible replay. Separate deterministic authoritative simulation from animations.

### Phase B — shareable asynchronous attacker challenges
A player publishes an **attack plan**: `planVersion`, `levelId`, `levelVersion`, `seed`, `allowedUnits`, `budget`, `actions:[{tick,lane,unitId,count}]`, `creatorId` and validation receipt. Send a shareable challenge link. The defender plays the plan later; results are replayable and match rules enforce spend, time, rate and enemy caps. Store versioned plans, receipts and optional scores server-side for public rankings; unverified local challenge links may be supported without being ranked.

### Phase C — live asymmetric PvP
Use one **Durable Object per room** with WebSockets as the authoritative ordered command processor. Defender sends movement/purchases; attacker sends spawn/deploy commands; server validates tick, energy, cooldowns, lane restrictions, rate, match version and budget. Clients render snapshots and optionally predict their own movement. Handle disconnects, spectators, reconnect, abusive content/user moderation and anti-cheat/ranking policy. Start with invited matches; add matchmaking only after fairness/latency acceptance.

## Implementation boundaries / safe rollout

1. **R1 Portals MVP (next functional slice)**: static curated manifest for two levels on the same origin; Level 1 remains intact; exit/select UI; local `RunSnapshotV1` storage and versioned link; score and upgrades restored with destination caps; back/return button; clear status label "local/unverified". No new server secrets required.
2. **R1b Passport / creator interop**: worker-issued/redeemed bounded handoff tickets, one-time receipt, replay/expiry testing, level manifest contracts, compat tables, optional account-backed progress. Add creator publishing only after trust boundaries work.
3. **R2 Attacker Lab**: new role UI + spawn rules/costs/cooldowns; AI defender; deterministic attack command log; basic attacker unit catalog. Reuse the simulator; no real-time backend requirement.
4. **R2b Shareable challenges**: publish and redeem immutable attack plans; seeded replay and ranking rules; allow player-designed enemy formations.
5. **R3 Live two-role multiplayer**: Durable Objects/WebSockets room authority, reconnect and fairness balancing.
6. **R4 Creator network**: curated community registry; versioned downloadable asset packs; creator templates, reputation and later economy only after moderation/trust requirements are met.

The earliest experiment should expose **one portal between two mini-levels and a separate attacker-lab toggle**, not force both major capabilities into one risky refactor.

## Acceptance criteria for R1

- iPhone Safari test starts from current Level 1, completes an explicit portal click, lands on Level 2, and can return safely.
- Cumulative score survives reload and navigation, while the per-level score obeys a visible documented policy.
- Compatible weapon upgrades transfer; incompatible ones are capped/translated, never silently lost; no duplicate payout from refreshing a portal URL.
- Missing/corrupt/replayed/expired transition data yields a recoverable safe error, never a fabricated high score.
- Static assets/Worker deploy, CI + run unit tests, owner mobile acceptance and CairnStone evidence precede production completion.

## Acceptance criteria for attacker phases

- Attacker can select enemy type, lane and dispatch timing under deterministic cost/cooldown rules.
- Replays of the same seed and attack plan produce the same simulation result; invalid/out-of-budget commands are rejected.
- Defender and attacker have independently testable win/loss conditions, analytics and fairness targets; no client can mint spend, enemy health or wins through arbitrary JSON.
- Multiplayer is never labeled live until two devices successfully complete a verified room match including reconnect.

## Non-goals (today)

No cross-origin competitive transfer, live PvP, creator scripting platform, real-money economy or new production matchmaking is implemented by this roadmap commit. This is a design/roadmap recording step only.

## Open design questions (defer to implementation review)

- Should a destination normalize loadouts at entry, or allow negotiated power budgets for casual versus ranked play?
- Which score is portable: career, chapter, level score, or all three tracked separately?
- Is a creator's attack deck open/public or hidden until a defense match ends?
- Should attacker dispatch cost refresh over time or arrive as a fixed pre-round budget?
- For external level creators, use a curated signed manifest pipeline first or an isolated iframe SDK?

Recommended defaults: track career + chapter/level scores separately; casual allows capped transferred gear; ranked uses normalized gear; start with time-refreshing attacker energy; curated signed manifests before public publishing.

## Provenance
GitHub repository: `nothinginfinity/browser-games-hub`.
Existing acceptance: GitHub Actions R0 validation run `39439919730`; deploy/smoke run `39439919392`. Owner mobile feedback supplied 2026-10-20.
