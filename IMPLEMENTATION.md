# Ballmac UI — implementation checklist

Living checklist for building Ballmac UI (plan: see "Architecture" below). Update it as work lands so any session can pick up where the last stopped.

Legend: `[x]` done and verified · `[~]` in progress · `[ ]` not started

## Verification gate (run after every phase)

```bash
pnpm build:registry   # metadata validation + shadcn build + site data
pnpm check            # dependency truth, license provenance, shadcn schema
pnpm test             # component tests (Vitest)
pnpm --filter @ballmac-ui/www typecheck
pnpm --filter @ballmac-ui/www lint
pnpm --filter @ballmac-ui/www build
pnpm smoke            # fresh app: shadcn add every item -> tsc + next build
```

Plus a visual pass: desktop and mobile, light and dark, no console errors, no horizontal overflow.

## Phases

### 1. Project foundation
- [x] pnpm + Turborepo monorepo (`apps/www`, `packages/metadata`, `registry`)
- [x] GitHub repo `vamsiy78/ballmac-ui` (private until launch), `main` + `preprod`
- [x] Vercel project `ballmac-ui` (root `apps/www`); domain `ui.ballmac.com` (DNS pending at BigRock)
- [ ] `preprod.ui.ballmac.com` → `preprod` branch

### 2. Design system
- [x] Theme tokens (`registry/ballmac/themes/theme.meta.ts`) → site CSS generated from the same source
- [x] Motion presets (`@ballmac/motion-presets`)
- [x] Authoring standard (`AUTHORING.md`)

### 3. Registry infrastructure
- [x] Metadata schema (`packages/metadata/src/schema.ts`)
- [x] Build: meta.ts → registry.json → `shadcn build` → site data
- [x] Alias-based install targets (`@components/ballmac/...`)
- [x] Checks: dependency truth, license provenance, schema validation, install smoke test
- [x] Blocks (`components/blocks/<name>/`) and templates (`app/<route>/page.tsx`) in the build
- [ ] Pro gated route (`/r/[name]` with license key) — Phase "Pro", not MVP

### 4. Catalog / data model
- [x] Generated index + embedded free sources
- [x] Categories, block categories, tiers
- [ ] Related items, changelog per item

### 5. Component pages
- [x] Preview/Code, install tabs, manual install, usage, examples, options, a11y, deps, AI, source, related
- [ ] Props table generated from TypeScript

### 6. Documentation / navigation
- [~] Docs: introduction, installation, registry, MCP, theming, licensing, changelog
- [ ] Docs sidebar navigation

### 7. Installation system
- [x] Package-manager tabs (pnpm, npm, yarn, bun), remembered site-wide
- [x] Manual install (deps + source)

### 8. CLI / registry examples
- [ ] Registry docs page with components.json, direct URL, namespaced install

### 9. MCP compatibility
- [x] shadcn MCP compatible (registry.json + examples + descriptions)
- [ ] `/api/v1` metadata API
- [ ] `@ballmac/mcp` server (packages/mcp)

### 10. Search
- [x] ⌘K command menu
- [ ] Catalog filters (category, type, tier) in URL params

### 11. Blocks
- [ ] 12 MVP blocks with full-page preview + viewport switcher

### 12. Templates
- [ ] `template-launch`

### 13. Pricing
- [ ] Pricing page (Free now, Pro coming)

### 14. Final polish
- [ ] OG images, sitemap, robots, JSON-LD
- [ ] Lighthouse ≥ 95, a11y (axe) on previews

## Components (MVP: 30)

| # | Item | Category | Status |
|---|---|---|---|
| 1 | button | primitives | [x] |
| 2 | input | primitives | [ ] |
| 3 | textarea | primitives | [ ] |
| 4 | label | primitives | [ ] |
| 5 | checkbox | primitives | [ ] |
| 6 | switch | primitives | [ ] |
| 7 | select | primitives | [ ] |
| 8 | badge | primitives | [ ] |
| 9 | avatar | primitives | [ ] |
| 10 | kbd | primitives | [ ] |
| 11 | tooltip | primitives | [ ] |
| 12 | dialog | primitives | [ ] |
| 13 | text-reveal | motion | [ ] |
| 14 | number-ticker | motion | [x] |
| 15 | marquee | motion | [ ] |
| 16 | spotlight-card | motion | [ ] |
| 17 | magnetic-button | motion | [ ] |
| 18 | border-beam | motion | [ ] |
| 19 | animated-grid | motion | [ ] |
| 20 | shimmer-text | motion | [ ] |
| 21 | ai-chat | ai | [ ] |
| 22 | ai-message | ai | [ ] |
| 23 | prompt-input | ai | [ ] |
| 24 | streaming-text | ai | [ ] |
| 25 | tool-call-card | ai | [ ] |
| 26 | reasoning-disclosure | ai | [ ] |
| 27 | terminal | developer | [ ] |
| 28 | code-block | developer | [ ] |
| 29 | install-tabs | developer | [ ] |
| 30 | api-key-field | developer | [ ] |

## Blocks (MVP: 12)

hero-1, hero-2, hero-3, features-1, features-2, pricing-1, faq-1, cta-1, footer-1, header-1, login-1, ai-chat-1 — all `[ ]`

## Architecture decisions log

- **Source layout mirrors install paths.** `registry/ballmac/components/x.tsx` installs to `@components/ballmac/x.tsx`; the site resolves the same `@/components/ballmac/*` imports via tsconfig paths.
- **`cn` comes from shadcn's `utils`** (`@/lib/utils`, registry dependency `shadcn:utils`), not a Ballmac copy.
- **Registry dependencies are emitted as absolute URLs** until `@ballmac` is listed in the shadcn registry index; then switch to `@ballmac/<name>`.
- **Free source is embedded at build time** (`lib/generated/sources.json`); the site never reads the filesystem at runtime, so private Pro source can never be bundled.
- **Dark mode via a head script**, not next-themes (React 19 script warning).
- **Search uses cmdk's built-in ranking** over the generated index; Orama is deferred until the catalog is large enough to need facets in the command menu.
- **`registry/` is a workspace package** declaring the libraries items may use, so pnpm's strict resolution catches undeclared imports.
