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
- [x] Automated `pnpm a11y` with axe-core + Playwright: all 147 preview examples in light and dark (294 checks), 0 serious/critical after Wave 1 batch 1
- [x] Wave 2 batch 1: all 167 preview examples in light and dark (334 checks), 0 serious/critical
- [x] Wave 2 batch 2: all 177 preview examples in light and dark (354 checks), 0 serious/critical
- [x] Wave 3: all 209 preview examples in light and dark (418 checks), 0 serious/critical; 52 test files / 121 tests; Base UI and Radix install smoke passed for all 332 registry entries
- [x] Wave 3 catalog Lighthouse (local mobile): accessibility, best practices, SEO 100; performance 85 (LCP 4.2 s)
- [~] Lighthouse on ui.ballmac.com (mobile): accessibility, best practices, SEO 100 on every page tested. Performance: hero-1 100, button 98, catalog 95, **home 89** (simulated LCP 3.3 s from the JS of five live demos; next: lazy-hydrate the showcase)

## Components (MVP: 30)

Wave 1 batch 1 (2026-09-29): alert, aspect-ratio, breadcrumb, card, empty,
pagination, progress, separator, skeleton, spinner. Component count: 68.

Wave 2 batch 1 (2026-09-30): file-dropzone, multi-select, tag-input,
number-input, password-input, search-field, phone-input, color-picker, rating,
time-picker. Component count: 78.

Wave 2 batch 2 (2026-09-30): date-range-picker, currency-input, stepper-form,
slider-range, signature-pad. Component count: 83. Wave 2 complete.

Wave 3 (2026-09-30): stat-card, kpi-row, timeline, activity-feed,
description-list, comparison-table, avatar-stack, progress-ring, sparkline,
contribution-graph, tree-view, file-tree, json-viewer, diff-viewer,
kanban-board, calendar-agenda. Component count: 99. Wave 3 complete.

Wave 4 complete (2026-09-30): banner, callout, status-dot, empty-state,
progress-steps, loading-dots, inline-alert, toast-stack, countdown,
shortcut-hint. Component count: 109. Registry validation passed for 362 entries;
130 tests, lint, typecheck, production Next.js build, and Base UI and Radix
fresh-app install builds passed. Browser axe scanned 229 previews in light and
dark (458 scans) with zero serious/critical findings. All 20 new previews passed
mobile overflow and browser-error checks in both themes; representative
screenshots were reviewed. See `research/wave-4-feedback.md` for competitor
patterns and design improvements. Lighthouse 13.5.0 on `/components` scored
85 performance and 100 each for accessibility, best practices, and SEO.

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

## Site redesign v2 (2026-09-29, second competitor pass)

Feedback: the home page looked like our own landing template and the site felt AI-generated. Re-studied shadcn/ui (home mosaic, Blocks toolbar), Magic UI (docs-style component pages), Aceternity (catalog cards, section hubs) and DaisyUI.

- [x] Neutral site palette (greys only; color comes from the components). `@ballmac/theme` itself is unchanged.
- [x] Header like shadcn: flat nav with active state (Docs, Components, Blocks, Templates, MCP, Pricing), wide ⌘K search, GitHub, X, theme; icon-only search on phones
- [x] Home rebuilt around a live mosaic: real components composed into app surfaces (settings, notifications, assistant chat, globe, revenue, terminal, Dynamic Island, dock, tabs), each captioned with links to what it uses; then collection tiles, templates, block categories, MCP. Removed the aurora hero, stats row, principles grid and beams CTA
- [x] Catalog moved into the docs shell (sidebar), thumbnail-then-caption cards, previews mounted lazily
- [x] Component pages: underline Preview/Code tabs with the toolbar inside the stage, CLI/Manual installation with numbered steps, short usage, credits, pager, TOC plus resources rail; no numbered section headings or mono eyebrows
- [x] Blocks index with sticky category nav in page order; block and template pages with a shadcn-style frame toolbar (view, viewports, reload, install command, Open in v0)
- [x] Multi-column footer
- [x] Checks: axe 0 serious/critical on 21 pages and 127 previews (light and dark); Lighthouse (local production build) home 87/100/100/100, catalog 87/100/100/100, dock 87/100/100/100, hero-4 96/100/100/100, CLS 0. Fixed along the way: api-key-field value is keyboard-focusable (1.0.1), notification-stack dismiss buttons are 24px (1.0.1)

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
- **Galleries mount previews lazily** (`LazyMount`, IntersectionObserver). Dozens of live demos hydrating at once cost the home page its performance score; the reserved box keeps layout stable.
- **The site uses a neutral palette over the published theme.** Components only read shadcn tokens, so the site doubles as proof they adapt to someone else's theme.
- **The license lives on one legal page (`/license`), not in the marketing UI.** Free items are still MIT (LICENSE, file headers, registry metadata unchanged); the site says "free to use" and links the terms from the footer. `/license` carries the full MIT text and third-party notices grouped by project, generated from `meta.source`. `/docs/licensing` redirects there.
- **Positioning is platform-neutral:** "Components with native-app polish" for any web product. The `macos` category is labelled "Desktop"; item titles stay literal where a component really is macOS-style (Dock, Mac Window, the Mac app template).

- **Docs and components share one layout** (the `(docs)` route group), so the sidebar stays mounted between them; its scroll position is also kept per tab (sessionStorage), so reloads and remounts do not jump it back to the top.
- **The catalog has no search box or category chips.** ⌘K in the header already searches everything, and section headings plus the collapsible sidebar categories cover navigation. The page offers Gallery / List / Index views (remembered) and Quick Look; `?category=` links still land on their section.
- **Sidebar component categories are collapsible** under one "Components" heading: collapsed on the catalog and docs, the current component's category open on its page, so the sidebar never repeats the catalog.
