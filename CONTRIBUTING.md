# Contributing

Thanks for helping. Bug reports, fixes and new items are all welcome.

## Before you start

- Open an issue for anything larger than a small fix, so we can agree on the direction first.
- Read `AUTHORING.md`: it defines what an item must include (metadata, examples, accessibility, RTL, reduced motion).
- Branches: open pull requests against `preprod`. `main` is what runs in production and only changes through a reviewed merge.
- Questions, help with an item or a Pro licence: [ui.ballmac.com/support](https://ui.ballmac.com/support). Issues are for bugs and requests.

## Setup

```bash
pnpm install
pnpm build:registry
pnpm dev
```

## Rules for code in this repo

- Tokens only: no hex or rgb colours in registry items. Use the theme variables.
- No `asChild` in registry JSX.
- Every interactive item works with the keyboard and respects `prefers-reduced-motion`; layout uses logical properties so it works in RTL.
- Code taken from another project must come from an MIT, ISC, BSD or Apache-2.0 licensed source. Add the
  "Based on" header line and fill `meta.source`. Never copy from paid kits or anything without a clear licence.

## Checks to run before a pull request

```bash
pnpm build:registry
pnpm check
pnpm lint
pnpm typecheck
pnpm test
pnpm a11y <name>     # for the items you touched
```

`pnpm smoke` installs every item into a fresh Next.js app; it needs network access to ui.shadcn.com.

## Changelog and releases

There are two kinds of release notes, and each is written once, in small pieces, at the time of the change.

**The site changelog** (ui.ballmac.com/changelog, `CHANGELOG.md`, the RSS and Atom feeds) tells people what is new. Add one Markdown file per release or wave to
`apps/www/content/changelog/`, named `YYYY-MM-DD-topic.md`:

```md
---
title: "Short headline"
date: 2026-10-18
tags: [blocks, MCP]          # blocks, components, templates, themes, pro, MCP, CLI, docs
releases: ["@ballmac/mcp 1.5.0"]   # optional: versions that shipped with it
summary: "One sentence."
shot: /preview/roster-1-demo   # a page to screenshot, or image: /marketing/x.webp
imageAlt: "What the picture shows."
---

### New

- [Roster 1](/blocks/roster-1) plans a week of shifts: one plain line, with a link to the page.

### Improved

### Fixed
```

Groups are `New`, `Improved`, `Fixed`, `Deprecated`, `Removed` and `Security` (Keep a Changelog: Added, Changed, Fixed, Deprecated, Removed, Security), in that order,
with at most six one-line bullets each. Then:

```bash
pnpm changelog:shots --base-url http://localhost:3000   # the pictures, light and dark
pnpm changelog                                           # CHANGELOG.md; `pnpm check` fails when it is stale
```

**Package releases** (`@ballmac/cli`, `@ballmac/mcp`, `@ballmac-ui/registry`) use [Changesets](https://github.com/changesets/changesets). In the pull request that changes a package,
add a note and commit it:

```bash
pnpm changeset        # pick the packages, patch / minor / major, and write one or two sentences for people who use the package
```

A pull request that changes `packages/cli`, `packages/mcp` or `packages/audit` source without a changeset fails CI (`pnpm changeset:check`); use `pnpm changeset --empty` when the change
needs no note. To release, run `pnpm version-packages`: it turns the notes into each package's `CHANGELOG.md`, bumps the versions and deletes the notes. Then tag the release as before
(`cli-v<version>`, `mcp-v<version>`) and put the version in `releases:` of the site changelog entry that announces it.

Item versions (`pnpm bump`, `versions.lock.json`) are separate: they track each component and block and feed the "What changed" notes on its page.

## Docs

The docs are MDX in `apps/www/content/docs/`, written by what the reader needs: get started, guides, reference and concepts. Read `docs/STYLE.md` first. Pages under `reference/` that carry
`generatedFrom` are written by code: `pnpm docs:generate` rewrites them and `pnpm check` fails when they are stale. Run `vale apps/www/content` for the prose rules.

## Pull requests

Target `preprod`. Describe what changed and why, link the issue, and include a screenshot for visual changes in light and
dark. Keep one concern per pull request.

By contributing you agree that your contribution is licensed under the MIT licence of this repository.
