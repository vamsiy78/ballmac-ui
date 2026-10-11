# Changelog

New components, blocks and changes, newest first. The same list is at https://ui.ballmac.com/changelog. This file is generated: edit `apps/www/lib/changelog.ts` and run `pnpm changelog`.

## 2026-10-11: Fixes: server-component crashes, and support for Next.js 16.4 Cache Components

- Bento Grid, Team Switcher, Lock Screen and Control Center failed with "Attempted to call isMediaImage() from the server" when a server component rendered them. The helper now lives in its own small item, media-image, and the components import it from there (Media still exports it for code that used it). Each is now 1.0.1, so `ballmac update` merges the fix into your copy
- The pages that read params in the Atlas, Goods, Podcast and Publication templates now do so inside Suspense, which Cache Components (the default in new Next.js 16.4 apps) requires: 1.0.1 each
- A new build check fails when a file that runs on the server imports a function from a file marked "use client", so this kind of crash is caught before it ships
- Next.js 16.4 turns on Cache Components in new projects, which does not allow reading the current time while a page is prerendered. Calendar, Date Picker and the Calendar 1 block did (react-day-picker reads today), so any page using them failed to build. Calendar now reads it inside Suspense with a same-size placeholder (pass `today` to skip that), Date Picker works out its year dropdown only when it opens, and Calendar 1 uses its own today: 1.0.1 each. Every free component, block and template, and every Pro block, now builds in a fresh Next.js 16.4 app with Cache Components on

## 2026-10-11: Update components without losing your edits, and install their tests

- New command line tool, `npx @ballmac/cli`: it runs the shadcn CLI for you and remembers what it installed (ballmac.lock.json), so `ballmac update` can merge a new version into your edited copy instead of overwriting it. Files you never touched are replaced, edits in other places are merged, and overlapping edits become conflict markers
- `ballmac outdated` lists what is behind with a note on what changed, `ballmac diff` shows your own changes, and `ballmac track` adopts items you installed with plain shadcn. Originals are backed up before anything is written, and `--dry-run` previews everything
- Every item now has a version and a changelog written for people who customised the file; component pages show them under What changed
- 200 free items ship with the test we run on them. `ballmac add dialog --with-tests` installs it next to the component, with the packages it needs and a vitest config if you have none
- The Ballmac MCP server gets two tools: `get_changes` (what changed since a version, breaking changes flagged) and `get_tests`
- A build check now fails when an item's files change without a version bump and a changelog entry

## 2026-10-07: Founding offer: $49 until 21 October, then $99

- Pricing page rebuilt around the founding offer: a live countdown to 21 Oct 2026, 11:59 pm IST, the $99 list price struck through
- See what is inside before you buy: the 40 second film with captions and six Pro block previews
- A free sampler of three Pro blocks for your email, and a reminder email 72 hours and 24 hours before the founding price ends
- Pro block pages and the locked copy-code prompt say when the founding price ends
- A Founders page and a desk in the Pro library: opt in to be listed by name and vote on the next blocks
- After 21 October, or when the 25 founding licences are gone, the site switches to $99 by itself

## 2026-10-07: Install with no setup, and cleaner theme links

- Ballmac UI is now in the official shadcn registry directory, so `npx shadcn@latest add @ballmac/button` works with nothing to configure. The registry entry is kept as a fallback for older CLIs and for the shadcn MCP server, which only reads components.json
- Theme builder: every preset has its own clean link (for example /themes/rose), a customised design is /themes?h=…, a note beside Copy link explains that your design lives in the link and is never stored, and copying is announced to screen readers
- Clearer page titles and descriptions for the components, blocks, templates and themes pages, structured data for the organisation and the website, and an llms.txt that now lists blocks, templates and Pro
- The analytics scripts load only on Vercel, so running the site locally or on your own host no longer logs console errors

## 2026-10-05: Log in to Pro with your licence key

- A Pro log in page at /pro: paste your licence key once, with no password and no account. The key stays in an encrypted cookie in your browser and is checked again on every request, so a revoked key stops working within minutes
- Your Pro library: install commands with your key already filled in (hidden on screen, real on the clipboard) for the shadcn CLI, AI agents through MCP and the starter apps, plus browser downloads of Beacon SaaS, Quire and the Figma tokens
- Pro block pages show the real source with copy buttons once you are logged in, while the pages stay public and static for everyone else
- A Log in and Get Pro button in the header, which becomes a Pro library link after you log in
- Buyers are logged in automatically when they return from checkout, with no key to paste
- A support page for bugs, questions, licence and billing help, and suggestions; messages go to a private inbox and you get a confirmation by email
- Pricing copy corrected: Pro adds 150 blocks and two starter apps (it has no templates)

## 2026-10-04: Quire, a second Pro starter, and a new look for Beacon

- Quire: an AI starter that answers from your own documents and shows its sources. Streaming chat with numbered citations that highlight the exact sentence, a document library with full-text search, usage limits per plan, Stripe billing, teams and a public API. It runs without an AI key on a built-in demo model
- Beacon SaaS was redesigned: a new landing page, sign-in and onboarding, and app shell

## 2026-10-03: Ballmac UI Pro and the first public release

- Ballmac UI Pro: 150 premium blocks (heroes, features, pricing, dashboards, app screens, ecommerce, content, sign-in and onboarding, marketing extras), all with light, dark and right-to-left support
- A private registry for Pro items, installed with the shadcn CLI and the MCP server using a licence key
- Beacon SaaS, the first Pro starter app: sign-in, workspaces with teams and invitations, Stripe billing, a dashboard and API keys
- Figma design tokens (W3C format) for all 13 themes, plus capture tooling for building a Figma library
- @ballmac/mcp 1.0 on npm: search the catalog, read when to use each item and get the install command from your agent
- A designed 404 and error page, tidier page titles and descriptions across the site, and stricter security headers

## 2026-10-02: Themes, right-to-left, translations and image slots

- Twelve free themes and a live builder: change hue, radius, density and font, check contrast in light and dark, then install
- Right-to-left support across components, blocks and templates, with an RTL toggle on every preview
- Built-in text moved behind one translation provider, with the full key list available as JSON
- Heroes, features, cards, galleries and templates take an image or media prop with required alt text and dark-mode variants

## 2026-10-01: Templates, blocks and a full audit

- Seventeen templates with their own look, from product sites to admin apps, docs, stores and a podcast
- Sixty-three free blocks grouped by purpose, from marketing sections to application screens
- Desktop and device components: windows, docks, menu bars, Finder-style browsing, Launchpad, lock screen and device frames
- Audit fixes: page weight cut from 7.5 to 11.8 MB of JavaScript down to 1.3 to 2.0 MB, hydration fixes for visitors who prefer reduced motion, focus rings and pinned dependency versions

## 2026-09-30: Forms, data, SaaS patterns and AI interfaces

- Forms: date and range pickers, currency, phone, tags, multi-select, stepper and signature pad
- Data display: calendar, data table, charts, carousel, drawer and resizable panels
- SaaS patterns: onboarding checklist, settings panel, usage meter, billing card, plan selector and notification center
- AI interfaces: chat messages, reasoning, tool calls, citations, a prompt box, agent plans and approval cards

## 2026-09-28: Ballmac UI preview

- Registry at ui.ballmac.com/r with the Ballmac theme and motion presets
- Primitives, motion, AI interface and developer components
- Blocks and a launch-page template
- Docs for installation, the CLI and registry, and MCP
