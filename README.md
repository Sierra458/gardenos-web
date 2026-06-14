# gardenos-web

Friends-and-family docs site for the Garden Monitor project. Lives at `garden.marsdesigns.io`.

Design spec: `Projects/Garden Monitor/Specs/2026-04-27-gardenos-web-design.md` (in the Obsidian vault).
Implementation plan: `Projects/Garden Monitor/Plans/2026-04-27-gardenos-web-plan.md`.

## Develop locally

```bash
npm install
npm run dev
```

In dev mode without `COOKIE_SECRET` set, the auth middleware bypasses (so you can iterate). To exercise the auth flow, set both `SITE_PASSWORD` and `COOKIE_SECRET` and `NODE_ENV=production` (or run E2E: `npm run test:e2e`).

## Publish updates from the vault

1. Edit notes in Obsidian. Add `publish: true`, `title:`, and `date:` to any note you want on the site.
2. Run:
   ```bash
   cp .env.local.example .env.local   # one-time, edit GARDEN_VAULT_PATH
   npm run publish
   ```
3. Vercel auto-deploys when the push hits `main`.

A `--dry-run` flag (or `GARDEN_DRY_RUN=1`) discovers + writes locally without committing or pushing — useful for previewing changes.

## Pre-flight (one-time, before first deploy)

- GitHub repo `gardenos-web` (private)
- Vercel project linked to repo
- Vercel DNS: `garden` CNAME → `cname.vercel-dns.com` on `marsdesigns.io`
- Vercel env vars (Production scope):
  - `SITE_PASSWORD` (the shared friends/family password)
  - `COOKIE_SECRET` (`openssl rand -base64 48`)

After env vars are set, trigger a redeploy so the auth middleware can read them.

## Tests

```bash
npm test          # unit tests (Vitest)
npm run test:e2e  # E2E auth smoke (Playwright)
```

Both should be run before any release. The E2E test catches integration bugs the unit tests miss (it caught a real one — Next.js middleware location — during initial build).

## Garden Console (admin-only, Phase 2 feature)

The admin-only `/console` route lets you chat with Claude to diagnose plants, draft photo notes, draft daily logs, and open AI-authored PRs.

### One-time setup
1. Provision Vercel Marketplace integrations (Upstash KV, Vercel Blob, AI Gateway).
2. Set `ADMIN_PASSWORD`, `AI_GATEWAY_API_KEY`, `GITHUB_TOKEN` in Vercel Production env vars.
3. On your Mac, clone a mirror of this repo for the inbox-sync launchd job:
   ```bash
   git clone git@github.com:Sierra458/gardenos-web.git ~/code/gardenos-web-mirror
   ```
4. Install both launchd jobs:
   ```bash
   cp tools/launchd/io.marsdesigns.gardenos-inbox-sync.plist ~/Library/LaunchAgents/
   cp tools/launchd/io.marsdesigns.gardenos-vault-publish.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/io.marsdesigns.gardenos-inbox-sync.plist
   launchctl load ~/Library/LaunchAgents/io.marsdesigns.gardenos-vault-publish.plist
   ```
   Verify they're running:
   ```bash
   launchctl list | grep gardenos
   tail ~/Library/Logs/gardenos-inbox-sync.log
   tail ~/Library/Logs/gardenos-vault-publish.log
   ```
5. Install the home-screen PWA on your phone: open `garden.marsdesigns.io/console` in Safari → Share → Add to Home Screen.

### Daily use
- Open the GardenOS Console PWA from your phone's home screen.
- Drop photos, ask "what's wrong?" (diagnose) or "tag these from today" (photo note) or "add to today's log: ..." (daily log).
- When Claude proposes content, reply "commit" to open a PR.
- Tap the PR link, review the diff, tap Merge. Vercel auto-deploys; vault-inbox files appear in `~/Documents/MaRs/Projects/Garden Monitor/_AI Inbox/` within 5 min, ready for you to file into their proper vault folders.
- The `gardenos-vault-publish` job watches the vault every 10 min and re-runs `npm run publish` whenever notes change — so a manual edit, a moved `_AI Inbox/` file, or an iOS Claude update all push to the site without you having to remember.

### Rollback
- **Instant:** Vercel Dashboard → Deployments → previous green → Promote to Production.
- **Permanent:** `gh pr revert <PR-number>` → merge revert PR.
- **Vault cleanup:** Delete the bad file from `~/Documents/MaRs/Projects/Garden Monitor/...`.

See `Projects/Garden Monitor/Specs/2026-05-17-garden-console-design.md` for full spec.

## Tech stack

- Next.js 15 (App Router) + React 19
- TypeScript 5 (strict)
- Tailwind CSS v4 (CSS-first config via `@theme`)
- Vitest 2 (unit) + Playwright (E2E)
- unified/remark/rehype + Obsidian-flavored extensions:
  - `remark-callouts` for `> [!note]` syntax
  - `@shikijs/rehype` for syntax highlighting (github-dark)
  - `rehype-mermaid` for diagrams (pre-mermaid strategy — client-side render)
  - Custom remark plugin for `[[wikilinks]]` resolution

## Repository layout

- `src/app/` — Next.js routes (home, login, log index, catch-all `[...slug]`)
- `src/components/` — UI components (Sidebar, ActivityFeed, SectionGrid)
- `src/lib/` — pure logic (frontmatter, slug, wikilink, content loader, markdown pipeline, auth)
- `src/middleware.ts` — Edge runtime auth gate
- `tools/sync.ts` — vault → content/ sync CLI (run via `npm run publish`)
- `content/` — synced markdown (git-tracked, but produced by the sync tool — don't edit by hand)

## Phase 2 (deferred)

Live sensor data from the Pi 5. See spec §11 for the seams already in place:
- Sidebar reserves a `data-section="live"` placeholder
- Activity feed cards have a `data-source` attribute (`"log"` in v1; `"sensor"` and `"alert"` will be added in Phase 2)

Other deferred items:
- Rate limiting on `/api/auth/login` (plan §7 — currently no throttle)
- Site search (Pagefind is the easy path when content grows)
