# NEON LANES — Browser Games Hub

An instant-play browser shooter for phone, tablet and desktop. No download, login or app store. The first and primary game is **Neon Lanes**, an original geometric lane shooter inspired by the quick-play lane-defense genre.

## Run locally
    npm install
    npm run dev

Alternatively serve public/ with an HTTP server (for example python3 -m http.server 8080 --directory public). The game uses native JS modules and Canvas 2D, without a bundler.

## Play
Swipe or drag left/right in the arena, tap direction buttons, or use A/D / arrow keys. Auto-fire destroys incoming colored shapes. Earn credits, buy five weapon upgrades (damage, rate, multishot, pierce, blast), collect boost gates, and survive escalating waves. Pause with Space/Escape. Personal best is stored in localStorage; sound is optional and off by default.

## Structure
- public/index.html and public/style.css: arcade UI
- public/game.js: renderer, touch, keyboard, HUD, audio
- public/sim.js: independent, deterministic game logic
- worker/index.js: Worker health endpoint, /api/health
- wrangler.jsonc: Cloudflare Workers + Static Assets
- tests/sim.test.mjs: gameplay tests
- docs/: architecture and roadmap
- .github/workflows/: validation and deployment definitions

## Test
    npm run check
    npm test

Node 20+ recommended; runtime has no external dependencies.

## Deploy to Cloudflare
GitHub is the source of truth. Pick ONE deployment controller:

**GitHub Actions**: Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID as repository Actions secrets (a scoped token that can deploy Workers and Static Assets). Pushes to main then deploy automatically. If either secret is absent, the deploy workflow skips safely. Locally use npm run deploy after Cloudflare authentication.

**Cloudflare Workers Builds**: Connect the repo nothinginfinity/browser-games-hub from Cloudflare Workers dashboard, track main, use deployment command npx wrangler deploy. Leave Actions deployment secrets unset to avoid duplicate deployment.

Game assets serve statically, with Worker-first only for /api/*. A GitHub commit is NOT production acceptance. Verify the actual live URL, health endpoint and iPhone gameplay before marking production or mobile-accepted.

## Collaboration
CairnStone source messages: msg:6c432856-73ba-4758-b457-29a07c1892ef and msg:033ce00a-359c-4aea-8ef9-7320b174eba7. See docs/ARCHITECTURE.md and docs/ROADMAP.md for expandability toward a multi-game hub and Durable Object multiplayer.
