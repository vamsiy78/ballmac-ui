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
pnpm smoke            # fresh app (Base UI init, the shadcn default): shadcn add every item -> tsc + next build
SMOKE_BASE=radix pnpm smoke   # same, in a Radix project
```

Plus a visual pass: desktop and mobile, light and dark, no console errors, no horizontal overflow.
And axe (zero serious/critical) on every `/preview/*` and the main site pages, light and dark.

## Phases

### 1. Project foundation
- [x] pnpm + Turborepo monorepo (`apps/www`, `packages/metadata`, `registry`)
- [x] GitHub repo `vamsiy78/ballmac-ui` (private until launch), `main` + `preprod`
- [x] Vercel project `ballmac-ui` (root `apps/www`); `ui.ballmac.com` live
- [x] `preprod.ui.ballmac.com` → `preprod` branch (behind Vercel preview protection)

### 2. Design system
- [x] Theme tokens (`registry/ballmac/themes/theme.meta.ts`) → site CSS generated from the same source
- [x] Motion presets (`@ballmac/motion-presets`)
- [x] Authoring standard (`AUTHORING.md`)

### 3. Registry infrastructure
- [x] Metadata schema (`packages/metadata/src/schema.ts`)
- [x] Build: meta.ts → registry.json → `shadcn build` → site data
- [x] Alias-based install targets (`@components/ballmac/...`)
- [x] Checks: dependency truth, license provenance, schema validation, no JSX `asChild` in shipped files, install smoke test (Base UI and Radix projects)
- [x] Blocks (`components/blocks/<name>/`) and templates (`app/<route>/page.tsx`) in the build
- [ ] Pro gated route (`/r/[name]` with license key) — Phase "Pro", not MVP

### 4. Catalog / data model
- [x] Generated index + embedded free sources
- [x] Categories, block categories, tiers
- [x] Related items (composesWith + category); `composesWith` validated at build
- [ ] Changelog per item

### 5. Component pages
- [x] Preview/Code, install tabs, manual install, usage, examples, options, a11y, deps, AI, source, related
- [x] Props table generated from TypeScript (ts-morph: own props, JSDoc, cva variants, defaults)

### 6. Documentation / navigation
- [x] Docs: introduction, installation, CLI & registry, MCP, theming, licensing, changelog
- [x] Docs sidebar navigation

### 7. Installation system
- [x] Package-manager tabs (pnpm, npm, yarn, bun), remembered site-wide
- [x] Manual install (deps + source)

### 8. CLI / registry examples
- [x] Registry docs page (registry add, namespaces, URLs, search, view, --diff, file locations)

### 9. MCP compatibility
- [x] shadcn MCP compatible (registry.json + examples + descriptions)
- [x] `/api/v1` metadata API (index.json, items/[name].json)
- [x] `@ballmac/mcp` server (packages/mcp): list_items, search_items, get_item, get_examples, get_install_command, compose_page, get_setup — tested; not yet published to npm

### 10. Search
- [x] ⌘K command menu
- [x] Catalog category filters in URL params (type and tier filters: later)

### 11. Blocks
- [x] 12 MVP blocks with full-page preview + viewport switcher

### 12. Templates
- [x] `template-launch` (installs components + app/launch/page.tsx)

### 13. Pricing
- [x] Pricing page (Free now, Pro coming)

### 14. Final polish
- [x] OG images, sitemap, robots, JSON-LD
- [x] axe: 0 serious/critical on all 67 previews and 17 site pages, light and dark
- [x] axe after the showpiece collection: 0 serious/critical on 127 previews and 21 pages, light and dark
- [~] Lighthouse on ui.ballmac.com (mobile): accessibility, best practices, SEO 100 on every page tested. Performance: hero-1 100, button 98, catalog 95, **home 89** (simulated LCP 3.3 s from the JS of five live demos; next: lazy-hydrate the showcase)

## Components (MVP: 30)

| # | Item | Category | Status |
|---|---|---|---|
| 1 | button | primitives | [x] |
| 2 | input | primitives | [x] |
| 3 | textarea | primitives | [x] |
| 4 | label | primitives | [x] |
| 5 | checkbox | primitives | [x] |
| 6 | switch | primitives | [x] |
| 7 | select | primitives | [x] |
| 8 | badge | primitives | [x] |
| 9 | avatar | primitives | [x] |
| 10 | kbd | primitives | [x] |
| 11 | tooltip | primitives | [x] |
| 12 | dialog | primitives | [x] |
| 13 | text-reveal | motion | [x] |
| 14 | number-ticker | motion | [x] |
| 15 | marquee | motion | [x] |
| 16 | spotlight-card | motion | [x] |
| 17 | magnetic-button | motion | [x] |
| 18 | border-beam | motion | [x] |
| 19 | animated-grid | motion | [x] |
| 20 | shimmer-text | motion | [x] |
| 21 | ai-chat | ai | [x] |
| 22 | ai-message | ai | [x] |
| 23 | prompt-input | ai | [x] |
| 24 | streaming-text | ai | [x] |
| 25 | tool-call-card | ai | [x] |
| 26 | reasoning-disclosure | ai | [x] |
| 27 | terminal | developer | [x] |
| 28 | code-block | developer | [x] |
| 29 | install-tabs | developer | [x] |
| 30 | api-key-field | developer | [x] |

## Showpiece collection (2026-09-29, after competitor review)

Research: shadcn/ui, Magic UI, Aceternity UI, Cult UI, Motion Primitives, Origin UI, ReUI, Tailark (home, catalog, component pages).
Positioning: **Mac-grade components for the web**. Ballmac makes Mac apps; nobody owns macOS-quality web UI.

- [x] macOS: dock, dynamic-island, mac-window, menu-bar, notification-stack, spotlight-search, segmented-control
- [x] Devices: laptop-frame, phone-frame, browser-frame
- [x] Backgrounds: globe (cobe), particles, meteors, aurora-background, beams-background, flickering-grid, dot-pattern
- [x] Motion and cards: animated-beam (credited to Magic UI, MIT), orbiting-circles, tilt-card, glow-border, confetti
- [x] Text: word-rotate, scramble-text, gradient-text
- [x] Layout and navigation: bento-grid, animated-tabs
- [x] Foundation: `color` lib (theme tokens for canvas/WebGL, theme observer)
- [x] Blocks: hero-4 (globe), hero-5 (Mac app laptop), features-3 (integrations beams), features-4 (Mac bento), testimonials-1, logo-cloud-1, cta-2 (waitlist)
- [x] Template: template-mac-app
- [x] Site redesign: docs-style sidebar with every component, component pages with preview toolbar (install chip, Open in v0, replay, full screen), Copy page for LLMs, prev/next, scroll-spy TOC, mobile nav; catalog with featured row, instant search and fit-to-card live previews; new home (live macOS desktop showcase, interactive wall, MCP beam diagram)

## Blocks (MVP: 12)

hero-1, hero-2, hero-3, features-1, features-2, pricing-1, faq-1, cta-1, footer-1, header-1, login-1, ai-chat-1 — all `[x]`

Also added: `accordion` (primitive, needed by faq-1).

## Architecture decisions log

- **Source layout mirrors install paths.** `registry/ballmac/components/x.tsx` installs to `@components/ballmac/x.tsx`; the site resolves the same `@/components/ballmac/*` imports via tsconfig paths.
- **`cn` comes from shadcn's `utils`** (`@/lib/utils`, registry dependency `shadcn:utils`), not a Ballmac copy.
- **Registry dependencies are emitted as absolute URLs** until `@ballmac` is listed in the shadcn registry index; then switch to `@ballmac/<name>`.
- **Free source is embedded at build time** (`lib/generated/sources.json`); the site never reads the filesystem at runtime, so private Pro source can never be bundled.
- **Dark mode via a head script**, not next-themes (React 19 script warning).
- **Search uses cmdk's built-in ranking** over the generated index; Orama is deferred until the catalog is large enough to need facets in the command menu.
- **Smoke test serves the registry from a separate process** (`scripts/serve-static.mjs`); an in-process server deadlocks against execSync.
- **Templates ship a reusable component plus a route** (`components/ballmac/templates/<name>/` + `app/<route>/page.tsx`), so the page is previewable on the site and installs as a real route.
- **`registry/` is a workspace package** declaring the libraries items may use, so pnpm's strict resolution catches undeclared imports.
- **No `asChild` in shipped JSX.** `shadcn init` now defaults to Base UI (`base-nova`), and the CLI rewrites `asChild` into Base UI's `render` prop, which breaks Radix files. Links and triggers are styled with `buttonVariants()`/`badgeVariants()` instead; components still accept `asChild`. Enforced by `pnpm check`; the smoke test covers both bases.
- **Catalog cards use a stretched title link**, not a link wrapping the preview: block previews contain real `<a>` elements, and nested links break hydration.
- **The catalog filter reads the URL after mount** instead of `useSearchParams`, which would drop the whole catalog out of the static HTML behind a Suspense boundary.
- **Decorative scaled previews are `inert`.** Scaled-down demos would otherwise expose tiny tap targets (WCAG 2.5.8); only tiles whose point is interaction (globe, tilt, beams) and the hero dock stay live.
- **Canvas and WebGL follow tokens** through `lib/ballmac/color.ts` (resolve CSS variables at runtime, repaint on theme change), so check-item's no-hex rule holds for effects too.
- **Menu bar status items sit beside the ARIA menubar**, not inside it; a menubar may only contain menu items.
