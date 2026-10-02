# Ballmac UI Pro and product depth: implementation plan

Started 2026-10-02. Work happens on `preprod`; nothing ships to `main` without the owner's go-ahead.

## Principles

- Everything already released free stays free. Pro is new work only.
- Pro source never reaches a public place: not `public/r`, not the site's code tabs, not `sources.json`, not the public API, and not a public Git repository. Before this repository goes public, Pro sources move to a private repository or package.
- The payment provider is swappable. Lemon Squeezy and Polar both act as merchant of record (they handle sales tax and VAT) and both issue licence keys; the site supports either through environment variables.
- Every Pro item passes the same gate as free items: tests, axe in light and dark, interacted states, a fresh-app install.

## Phase 1: Pro infrastructure (done 2026-10-02)

1. Close the source leak: component, block and template pages show no code for Pro items; previews stay visible.
2. Licence validation (`apps/www/lib/license.ts`): Lemon Squeezy and Polar adapters, test keys for development, ten-minute cache, a public `POST /api/v1/license/verify`.
3. Private registry route `GET /r/pro/{name}.json`: reads the Pro build, requires `Authorization: Bearer <licence key>`, never cached publicly. Pro items depend on other Pro items as `@ballmac-pro/<name>` so the shadcn CLI sends the key for those too.
4. Site: Pro badge and filter in galleries, a Pro install section on item pages, a working pricing page (checkout links from environment variables, waitlist when they are not set), and a `/docs/pro` guide (licence key, `components.json` registry entry, install, teams).
5. MCP: Pro-aware install commands and setup; `BALLMAC_LICENSE_KEY` lets `get_item` return Pro source to licensed users.
6. Verification: unit tests for licence logic; an end-to-end install of a Pro item with the real shadcn CLI against the local site, with and without a key.

Owner to provide later: a Lemon Squeezy or Polar product, its IDs and checkout links (environment variables listed in `/docs/pro` and `apps/www/.env.example`), and a private repository for Pro sources, added as a submodule at `registry/pro` or cloned there during the deploy build.

## Phase 2: Theme presets and theme builder (done 2026-10-02)

- 12 theme presets as free `registry:theme` items (installable with the CLI), each validated for contrast in light and dark.
- `/themes` builder: pick a preset, adjust hue, radius, fonts and density with a live preview of real components and blocks, export CSS or install through a generated registry item. Builder is free (it brings traffic); Pro adds saved themes later if wanted.

## Phase 3: Right-to-left and i18n (done 2026-10-02)

- Convert physical spacing and positioning to logical properties (`ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`, `text-start`) across components, blocks and templates; mirror directional icons with `rtl:`.
- Every hard-coded user-facing string becomes a prop with an English default (`labels` objects).
- RTL toggle on previews; axe and overflow sweeps also run with `dir="rtl"`.

## Phase 4: Image slots (done 2026-10-02)

- Heroes, features, cards, galleries and templates accept `image`/`media` props (URL or element) with fixed aspect ratios, required alt text and the current generated art as the fallback.

## Phase 5: Premium blocks (about 150, in batches of 15 to 20). Batch 1 (20 heroes), batch 2 (20 features) and batch 3 (15 pricing), batch 4 (25 dashboards and app screens), batch 5 (20 testimonials, logos, stats and CTA), batch 6 (15 ecommerce) and batch 7 (15 content, blog, changelog, FAQ and careers) done 2026-10-02

Order by what people buy: heroes (20), features (20), pricing (15), dashboards and app screens (25), testimonials, logos, stats and CTA (20), ecommerce (15), content and blog (15), auth and onboarding (10), marketing extras (10). Same research and quality bar as free blocks. Free blocks stay at 63 plus occasional additions.

## Phase 6: SaaS starter apps (Pro)

A complete Next.js app per starter: Better Auth (MIT) for sign-in, Drizzle ORM with Postgres, Stripe subscriptions and customer portal, email, settings, team invites, dashboard, marketing site from Ballmac templates. Delivered as a private repository or download after purchase, not through the registry. First starter: "Beacon SaaS"; then an AI app starter.

## Phase 7: Figma kit

- Export tokens in the W3C design token format (imports into Figma variables through a plugin) and every block and template as SVG or HTML capture at desktop and mobile widths.
- Assembling components and auto-layout in Figma needs a designer and Figma itself; this repository provides the sources.

## Later

- Vue and Svelte ports, once Pro is selling.
