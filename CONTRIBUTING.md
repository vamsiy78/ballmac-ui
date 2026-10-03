# Contributing

Thanks for helping. Bug reports, fixes and new items are all welcome.

## Before you start

- Open an issue for anything larger than a small fix, so we can agree on the direction first.
- Read `AUTHORING.md`: it defines what an item must include (metadata, examples, accessibility, RTL, reduced motion).
- Work from `preprod`. `main` is production and only changes through a reviewed merge.

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

## Pull requests

Target `preprod`. Describe what changed and why, link the issue, and include a screenshot for visual changes in light and
dark. Keep one concern per pull request.

By contributing you agree that your contribution is licensed under the MIT licence of this repository.
