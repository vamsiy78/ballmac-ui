# Handover: grow Ballmac UI to 200+ components

Written 2026-09-29 for the next agent (Codex). Read this, then `AUTHORING.md` (the binding item standard), then skim `IMPLEMENTATION.md` (history and decisions). This file wins where they differ on process; `AUTHORING.md` wins on how an item is written.

## 1. Where things stand

- **Product:** a shadcn-compatible registry (`@ballmac`, `https://ui.ballmac.com/r/{name}.json`) plus the docs site in `apps/www` (Next.js 16, React 19, Tailwind v4, Motion 12, Radix via `radix-ui`).
- **Catalog on `preprod`:** 202 components, 19 blocks, 2 templates. Waves 1 to 8 are complete; Wave 9 is in progress (batch A of 3 done).
- **Site:** redesigned; the catalog has Gallery / List / Index views and Quick Look; sidebar component categories are collapsible, so the site scales to 200+ items without changes.
- **Branches:** `preprod` is where work lands (Vercel preview, behind Vercel login). `main` is production, which the owner has deliberately disabled. **Never push to `main`** unless the owner asks.
- **Working tree:** check `git status` before starting another batch. The Wave 4 commit also fixes duplicate React keys in component-page accessibility tables when shortcut labels repeat.

## 2. The goal

Reach **200+ components**, each at a quality that beats shadcn/ui: same accessibility floor, more polish (motion, states, dark mode), better docs. Quality over count: 150 excellent items beat 250 thin ones, but the owner's floor is 200.

"Beats shadcn" means every item has:

1. Every state: default, hover, focus-visible, active, disabled, loading or empty where relevant, invalid for inputs, light and dark.
2. Full keyboard support and correct ARIA (Radix for anything with focus management), listed in `meta.ai.a11y`.
3. Reduced-motion behaviour (`useReducedMotion` or `motion-reduce:`), infinite animations stop.
4. Tokens only (shadcn CSS variables), so it follows any theme; canvas/WebGL colors through `@/lib/ballmac/color`.
5. A props type with JSDoc on every prop (the site's API table is generated from it).
6. A `-demo` example that makes someone want to install it, plus 1–3 more examples showing variants or real use.
7. A test in `registry/tests/` for anything interactive (keyboard, controlled and uncontrolled).
8. No layout shift, no horizontal overflow at 360 px, SSR-safe.

## 2b. Research every component against the best, then beat it

Before building any component, look at how the best libraries do it and write down (in the PR/commit notes, briefly) what you are taking and what you are doing better. The owner wants "crazy good" UI/UX, not generic components: someone seeing the demo should want to install it immediately.

- **Study all of them:** shadcn/ui (structure, API shape, accessibility), Magic UI and Motion Primitives (motion feel), Aceternity UI (bold visual moments), DaisyUI (breadth, variants, theming), Origin UI and ReUI (product-UI breadth), Cult UI, Kibo UI, 21st.dev, Tailwind Plus and Apple's Human Interface Guidelines (polish and interaction details).
- **Take the best idea from each, then go further:** better defaults, more states, smoother springs, real keyboard support, better dark mode, a more convincing demo. If a competitor's version is already excellent, ours must still add something (an extra variant, better accessibility, a nicer demo, fewer dependencies).
- **Studying is not copying.** You may look at any library's demos to understand the UX. Code can only come from the permissive sources in section 3; for Aceternity, Tailwind Plus and paid kits, write your own implementation from scratch.
- **Demos sell the component.** Realistic, specific content (Acme, neutral product copy), shown at its best in the catalog thumbnail and Quick Look.

## 3. Licensing: the one rule you must not break

The owner said "borrow competitors' code". That is only allowed from **permissively licensed** sources: **MIT, ISC, BSD-2/3, Apache-2.0**.

- **Allowed, after checking the LICENSE file at copy time:** shadcn/ui (MIT), Magic UI free (MIT), Motion Primitives (MIT), DaisyUI (MIT; CSS, so port its patterns into React), Origin UI (verify), Cult UI free (verify), Kibo UI (verify), Animata (verify), ReUI (verify), individual 21st.dev components (license varies per component: check each).
- **Never, not even "for inspiration by copying":** Aceternity UI (free components are not redistributable), Tailwind Plus / Tailwind UI, Magic UI Pro, Cult Pro, shadcnblocks, any paid kit, anything without a clear license. Implementing a common *idea* (a globe, a marquee, a dock) from scratch is fine.
- **When you reuse code:** keep the second header line `// Based on <project> (<license>, <copyright>), <what changed>.` and fill `meta.source` (`{ name, url, license, copyright, modified: true }`). `pnpm check` runs `check-licenses.ts`. The site's `/license` page lists third-party notices automatically from `meta.source`.
- **Do not show "MIT" in the site UI.** The owner wants the license only on `/license` (and in the repo's LICENSE and file headers).
- **Restyle, don't paste.** Reused code must be converted to Ballmac conventions (tokens, `data-slot`, plain function components, no `forwardRef`, no `asChild` in JSX, presets from `@/lib/ballmac/motion`).

## 4. How to add an item (per component)

1. Files, as in `AUTHORING.md`: `registry/ballmac/components/<name>.tsx`, `<name>.meta.ts`, `registry/examples/<name>-demo.tsx` (+ more examples), `registry/tests/<name>.test.tsx` if interactive.
2. Pick a `category` from `packages/metadata/src/schema.ts`. Categories with no items yet (`forms`, `data-display`, `feedback`, `marketing`, `saas`, `dashboards`) already exist; their labels and sidebar order live in `apps/www/lib/registry.ts` (`categoryLabels`, `categoryOrder`). Add a label there when a category gets its first item.
3. New npm dependencies: add to `registry/package.json` (and `apps/www/package.json` if the site imports it directly), run `npx -y pnpm@10 install`, and list the package in the item's `dependencies`. Already planned and acceptable: `sonner`, `vaul`, `embla-carousel-react`, `react-day-picker` + `date-fns`, `input-otp`, `recharts`, `react-resizable-panels`, `@tanstack/react-table`, `react-hook-form` + `@hookform/resolvers`. Avoid anything heavy or unmaintained.
4. Check the item: `node_modules/.bin/tsx scripts/check-item.ts <name> [...]`, then `(cd apps/www && npx tsc --noEmit)` and `(cd registry && npx vitest run tests/<name>.test.tsx)`.
5. Look at it: `cd apps/www && npx next dev -p 3300`, open `/components/<name>`, the catalog (`/components`) in all three views, and Quick Look. Light and dark, desktop and 390 px wide.

## 5. Batch gate (after every batch of roughly 10–20 items, before committing)

Run from the repo root (pnpm isn't global; use `npx -y pnpm@10`):

```bash
npx -y pnpm@10 check                                  # registry build, deps truth, licenses, schema validation
npx -y pnpm@10 test                                   # vitest
npx -y pnpm@10 --filter @ballmac-ui/www lint
npx -y pnpm@10 --filter @ballmac-ui/www typecheck
(cd apps/www && npx next build)                       # static build of every page
npx -y pnpm@10 smoke                                  # installs every item into a fresh app (Base UI default)
SMOKE_BASE=radix npx -y pnpm@10 smoke                 # same with Radix
```

All must pass. Then commit on `preprod` with a descriptive message listing the items, and push to `origin preprod`.

Accessibility: run `npx -y pnpm@10 a11y` (axe-core; serious + critical must be 0) on every `/preview/<example>` in light and dark, and Lighthouse on `/components` after big batches.

## 6. Roadmap to 200+

### Implementation status (2026-09-30)

| Wave | Planned | Implemented | Still to build | State |
| --- | ---: | ---: | ---: | --- |
| 1 · shadcn parity | 43 | 43 | 0 | Shipped (batches 1–4) |
| 2 · forms beyond shadcn | 15 | 15 | 0 | Shipped |
| 3 · data display | 16 | 16 | 0 | Shipped |
| 4 · feedback and status | 10 | 10 | 0 | Shipped |
| 5 · navigation and layout | 14 | 14 | 0 | Shipped |
| 6 · SaaS patterns | 12 | 12 | 0 | Shipped |
| 7 · AI interfaces | 12 | 0 | 12 | Not started |
| 8 · developer | 10 | 0 | 10 | Not started |
| 9 · motion and effects | 35 | 0 | 35 | Not started |
| 10 · desktop and devices | 15 | 0 | 15 | Not started |

The original 58 components plus 61 shipped wave items make **119 on `preprod`**; batches 3 (12) and 4 (11) Wave 5 (14), Wave 6 (12), Wave 7 (12) and Wave 8 (10) and Wave 9 batch A (12) bring the working tree to **202**. The listed roadmap has **38 components still to build** and would reach about **240** if completed. Reaching the 200-component floor is already past the floor at **202**; the remaining 38 take it to about **240**. Finish Waves 9–10 in batches of 10–20. Finish the 23 missing Wave 1 parity items, then continue Waves 5–10 in batches of 10–20.

Existing (58, do not duplicate): accordion, ai-chat, ai-message, animated-beam, animated-grid, animated-tabs, api-key-field, aurora-background, avatar, badge, beams-background, bento-grid, border-beam, browser-frame, button, checkbox, code-block, confetti, dialog, dock, dot-pattern, dynamic-island, flickering-grid, globe, glow-border, gradient-text, input, install-tabs, kbd, label, laptop-frame, mac-window, magnetic-button, marquee, menu-bar, meteors, notification-stack, number-ticker, orbiting-circles, particles, phone-frame, prompt-input, reasoning-disclosure, scramble-text, segmented-control, select, shimmer-text, spotlight-card, spotlight-search, streaming-text, switch, terminal, text-reveal, textarea, tilt-card, tool-call-card, tooltip, word-rotate.

The waves below retain the original roadmap order; Waves 2–4 were tackled before Wave 1 parity was finished. Work in batches of 10–20. Names are suggestions; keep them kebab-case and permanent once published.

**Wave 1: shadcn parity (43 planned, category `primitives` / `navigation` / `forms` / `data-display` / `feedback`).** Base on shadcn/ui (MIT) and upgrade. This is what makes "beats shadcn" true.
alert, alert-dialog, aspect-ratio, breadcrumb, button-group, calendar, card, carousel, chart, collapsible, combobox, command, context-menu, data-table, date-picker, drawer, dropdown-menu, empty, field, form, hover-card, input-group, input-otp, item, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, separator, sheet, sidebar, skeleton, slider, spinner, table, tabs, toast (sonner), toggle, toggle-group.

Wave 1 batch 1 complete: alert, aspect-ratio, breadcrumb, card, empty, pagination, progress, separator, skeleton, spinner. Research and design decisions: `research/wave-1-batch-1.md`. Automated preview axe check: `pnpm a11y` after `next build`.

Wave 1 batch 2 complete: alert-dialog, button-group, collapsible, hover-card, popover, radio-group, scroll-area, tabs, toggle, toggle-group. Research and design decisions: `research/wave-1-batch-2.md`. Registry validation passed for 392 entries; 147 tests, lint, typecheck, production build, and Base UI/Radix fresh-app install builds passed. Axe scanned all 249 previews in light and dark (498 scans) with zero serious/critical findings; separately scanned both open alert-dialog variants and fixed a dark-theme destructive-action contrast issue. The new previews and docs pages passed mobile browser checks; catalog views and Quick Look worked. Lighthouse 13.5.0 on `/components`: performance 83, accessibility 100, best practices 100, SEO 100.

Wave 1 batch 3 written (12): command, combobox, context-menu, dropdown-menu, field, input-group, item, menubar, navigation-menu, sheet, slider, table. Research and design decisions: `research/wave-1-batch-3.md`. **Gate status (2026-09-30, cloud session):** registry build/check (428 entries, schema valid), 171 tests, lint, typecheck and production build passed. Axe scanned all 273 previews in light and dark (546 scans) with zero serious/critical findings; `scripts/a11y-open-states.ts` opened every new overlay at desktop and 390 px in light and dark with no findings beyond the known Radix `aria-hidden-focus` pattern (see the research note). Component pages, catalog views and Quick Look showed no overflow or console errors. **Official Base UI and Radix smokes still not run** (that cloud environment's network policy denied `ui.shadcn.com`, needed by `shadcn init`). Substitute run: a fresh create-next-app with latest npm dependencies and every built registry file written to its install path typechecked and built all 273 examples (this caught `lucide-react` no longer exporting `Github`, fixed in item-demo). It does not exercise the shadcn CLI, so run `pnpm smoke` and `SMOKE_BASE=radix pnpm smoke` where `ui.shadcn.com` is reachable before promoting to main.

Wave 1 batch 4 (11, completes Wave 1): calendar, carousel, chart, data-table, date-picker, drawer, form, input-otp, resizable, sidebar, toast (sonner). Research and design decisions: `research/wave-1-batch-4.md`. **Gate (2026-09-30, cloud session):** registry check (462 entries), 202 tests, lint, typecheck and production build passed; axe over 296 previews in light and dark (592 scans) found 0 serious/critical, and `scripts/a11y-open-states.ts` scanned every opened overlay; component pages, catalog views and Quick Look had no overflow or console errors at desktop and 390 px; a fresh Next app with latest npm dependencies typechecked and built all 296 examples. **Still to run: the official Base UI and Radix CLI smokes (`pnpm smoke`, `SMOKE_BASE=radix pnpm smoke`)**, which need `ui.shadcn.com`. New dependencies are pinned in the item metadata: react-day-picker 9, @tanstack/react-table 8, react-resizable-panels 3 (later majors have different APIs), embla-carousel-react 8, recharts 3, vaul 1, input-otp 1, sonner 2, react-hook-form 7.

**Wave 2: forms beyond shadcn (≈15, `forms`).** file-dropzone, multi-select, tag-input, number-input, password-input (strength meter), search-field, phone-input, color-picker, rating, date-range-picker, time-picker, currency-input, stepper-form (wizard), slider-range, signature-pad.

Wave 2 complete. Batch 1: file-dropzone, multi-select, tag-input, number-input, password-input, search-field, phone-input, color-picker, rating, time-picker. Batch 2: date-range-picker, currency-input, stepper-form, slider-range, signature-pad. Research and design decisions: `research/wave-2-batch-1.md` and `research/wave-2-batch-2.md`.

**Wave 3: data display (≈16, `data-display`).** stat-card, kpi-row, timeline, tree-view, file-tree, json-viewer, diff-viewer, kanban-board, contribution-graph, sparkline, progress-ring, description-list, activity-feed, comparison-table, avatar-stack, calendar-agenda.

Wave 3 complete. Batch 1: stat-card, kpi-row, timeline, activity-feed, description-list, comparison-table, avatar-stack, progress-ring, sparkline, contribution-graph. Batch 2: tree-view, file-tree, json-viewer, diff-viewer, kanban-board, calendar-agenda. Research and design decisions: `research/wave-3-batch-1.md` and `research/wave-3-batch-2.md`.

**Wave 4: feedback and status (≈10, `feedback`).** banner, callout, status-dot, empty-state, progress-steps, loading-dots, inline-alert, toast-stack (macOS style), countdown, shortcut-hint.

Wave 4 complete. Research and design decisions: `research/wave-4-feedback.md`. Registry validation passed for all 362 entries; 130 tests, lint, typecheck, production build, and Base UI and Radix fresh-app install builds passed. Browser axe checked all 229 previews in light and dark (458 scans) with zero serious or critical findings. The 20 Wave 4 previews passed 40 mobile browser checks with no page errors or horizontal overflow; representative light and dark screenshots were reviewed. Lighthouse 13.5.0 on `/components`: performance 85, accessibility 100, best practices 100, SEO 100.

**Wave 5: navigation and layout (≈14, `navigation` / `layout`).** navbar, mega-menu, floating-nav, app-shell, team-switcher, sticky-scroll, split-view, masonry-grid, scroll-progress, back-to-top, table-of-contents, container-scroll, section-tabs, command-bar.

Wave 5 complete (2026-09-30). Research and design decisions: `research/wave-5-navigation-layout.md`. Adds the `scroll` lib (scroll state, direction, spy, reduced-motion-aware scrolling) and a `viewportAlign` option on `navigation-menu`; `command` gained an `icon` prop on items. **Gate:** registry check (505 entries), 233 tests, lint, typecheck and production build pass; axe over all 324 previews in light and dark (648 scans) plus opened overlays is clean; a fresh Next app builds all 324 examples; see `IMPLEMENTATION.md`. Official shadcn CLI smokes for this wave still to run where `ui.shadcn.com` is reachable.

**Wave 6: SaaS patterns (≈12, `saas`).** onboarding-checklist, settings-panel, billing-card, usage-meter, plan-selector, invite-members, notification-center, feedback-widget, changelog-feed, cookie-consent, user-menu, workspace-card.

Wave 6 complete (2026-09-30). Research and design decisions: `research/wave-6-saas-patterns.md`. Components use foreground-colored text on tinted chips (colored small text failed axe contrast), fixed-locale UTC dates and money, and examples that pass handlers are client components. **Gate:** registry check (541 entries), 269 tests, lint, typecheck and production build pass; axe over all 348 previews in light and dark (696 scans) plus interacted states is clean; a fresh Next app builds all 348 examples. Official shadcn CLI smokes for Waves 1 batch 4, 5 and 6 still to run where `ui.shadcn.com` is reachable.

**Wave 7: AI interfaces (≈12, `ai`).** model-picker, suggestion-chips, citation, sources-list, chat-attachment, voice-input, ai-orb, artifact-panel, thinking-indicator, token-meter, agent-plan, approval-card.

Wave 7 complete (2026-09-30). Research and design decisions: `research/wave-7-ai-interfaces.md`. Status is always icon plus words, cycling text and timers are hidden from screen readers behind one calm announcement, and nothing is fetched from third parties. **Gate:** registry check (577 entries), 321 tests, lint, typecheck and production build pass; axe over all 372 previews in light and dark (744 scans) plus interacted states is clean; a fresh Next app typechecks and builds all 24 Wave 7 examples. Official shadcn CLI smokes for Wave 1 batch 4 and Waves 5 to 7 still to run where `ui.shadcn.com` is reachable.

**Wave 8: developer (≈10, `developer`).** api-endpoint, env-editor, log-stream, copy-button, snippet-tabs, status-badge-row, webhook-card, keyboard-shortcuts, package-badge, git-graph.

Wave 8 complete (2026-10-01). Research and design decisions: `research/wave-8-developer.md`. Adds the shared `highlight` tokenizer lib (theme-aware token colors, no dependency) and `copy-button`, which the other developer components reuse. **Gate:** registry check (608 entries), 367 tests, lint, typecheck and production build pass; axe over all 392 previews in light and dark (784 scans) plus interacted states is clean; a fresh Next app typechecks and builds all 20 Wave 8 examples. Official shadcn CLI smokes for Wave 1 batch 4 and Waves 5 to 8 still to run where `ui.shadcn.com` is reachable.

**Wave 9: motion and effects (≈35, `motion` / `text` / `backgrounds`).** Base on Magic UI and Motion Primitives (MIT) where it saves time. animated-list, blur-fade, text-animate, typing-text, hyper-text, sparkles-text, morphing-text, spinning-text, highlighter, rainbow-button, shiny-button, pulse-button, ripple, retro-grid, grid-pattern, interactive-grid, warp-background, light-rays, noise-texture, progressive-blur, scroll-velocity, smooth-cursor, icon-cloud, lens, circular-progress, video-dialog, avatar-circles, magic-card, neon-card, glare-hover, dotted-map, animated-number-flow, in-view, stagger-list, spring-drawer.

Wave 9 is split in three batches. **Batch A done (2026-10-01):** blur-fade, text-animate, typing-text, hyper-text, sparkles-text, morphing-text, spinning-text, highlighter, rainbow-button, shiny-button, pulse-button, ripple. Research: `research/wave-9-batch-a-text-buttons.md`. **Gate:** registry check (644 entries), 408 tests, lint, typecheck and production build pass; axe over all 416 previews in light and dark (832 scans) plus interacted states (waiting for animations to finish) is clean; a fresh Next app typechecks and builds all 24 batch A examples. Animation feel is not verifiable from screenshots, so each batch should be eyeballed on the preview deployment. **Batch B (next):** animated-list, stagger-list, in-view, animated-number-flow, circular-progress, avatar-circles, magic-card, neon-card, glare-hover, lens, spring-drawer, video-dialog. **Batch C:** retro-grid, grid-pattern, interactive-grid, warp-background, light-rays, noise-texture, progressive-blur, scroll-velocity, smooth-cursor, icon-cloud, dotted-map. Official shadcn CLI smokes for Wave 1 batch 4 and Waves 5 to 9 still to run where `ui.shadcn.com` is reachable.

**Wave 10: desktop and devices, the differentiator (≈15, `macos` (labelled "Desktop") / `devices`).** finder-window, file-browser, mac-context-menu, sheet-dialog (macOS sheet), toolbar, window-manager (draggable windows), desktop-icons, launchpad, lock-screen, control-center, hud (volume/brightness), widgets (weather, calendar, battery), tablet-frame, watch-frame, android-frame.

That is about 180 new items, reaching roughly 240. Blocks (pricing-2, signup-1, dashboard-1, settings-1, billing-1, header mega-menu) and templates (saas, ai-app, dashboard, devtool) follow once Wave 1–3 components exist.

## 7. Lessons already paid for (avoid these)

- **No `asChild` in JSX.** The shadcn CLI rewrites it for Base UI projects and breaks Radix files. `pnpm check` fails on it.
- **React compiler lint:** no synchronous `setState` in an effect body (derive the value, use `useSyncExternalStore`, or set state in a callback), and no reading `ref.current` during render (pass refs explicitly, don't index arrays of refs).
- **SSR:** no `window`/`document` in render; number and date formatting with a fixed `"en-US"` default and a `locale` prop.
- **Demos:** give the `-demo` a single root sized `w-full max-w-*`; catalog thumbnails scale the demo's measured size (`FitPreview`), so a root that's wider than its content leaves empty space.
- **Scrolling libraries:** cmdk calls `scrollIntoView`, which scrolls the whole page when the component is below the fold. `spotlight-search.tsx` shows the fix (route item/heading `scrollIntoView` to the list). Check any list-based component for the same problem.
- **Axe findings we hit:** scrollable regions must be focusable (`tabIndex={0}`), touch targets at least 24 px, don't use `text-foreground/40`-style low contrast (use `text-muted-foreground`), decorative layers `aria-hidden`, a `menubar` may only contain menu items.
- **Inert previews:** decorative scaled previews on the site are `inert`; don't make catalog thumbnails interactive, Quick Look is the interactive path.
- **Registry dependencies:** every `@/components/ballmac/*` import must be in `registryDependencies`, every npm import in `dependencies`, nothing unused (`check-deps.ts`).
- **Marketing copy:** platform-neutral ("feel native", not Mac-only); no invented numbers, testimonials or claims; don't mention the upstream projects of the owner's Mac apps.

## 8. Handy paths

- Item standard: `AUTHORING.md`; schema: `packages/metadata/src/schema.ts`.
- Reference items: `button.tsx` (primitive), `number-ticker.tsx` (motion), `dock.tsx` (complex interactive), `spotlight-search.tsx` (cmdk + scroll fix), `globe.tsx` (WebGL + color lib).
- Site: catalog `apps/www/app/(site)/(docs)/components/page.tsx`, Quick Look `apps/www/components/site/catalog-context.tsx`, component page `apps/www/app/(site)/(docs)/components/[slug]/page.tsx`, sidebar `apps/www/components/site/docs-sidebar.tsx`.
- Build pipeline: `scripts/build-registry.ts` (metadata → `registry.json` → `shadcn build` → site index, sources, examples map).
