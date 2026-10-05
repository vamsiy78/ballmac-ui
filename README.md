# Ballmac UI

[![CI](https://github.com/vamsiy78/ballmac-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/vamsiy78/ballmac-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm @ballmac/mcp](https://img.shields.io/npm/v/@ballmac/mcp?label=%40ballmac%2Fmcp)](https://www.npmjs.com/package/@ballmac/mcp)

Accessible React + Tailwind v4 components, blocks and templates in one design language, distributed as a
[shadcn](https://ui.shadcn.com) registry and usable from AI agents through MCP. Site: https://ui.ballmac.com

```bash
npx shadcn@latest add @ballmac/button
```

Files install into `components/ballmac/`, so they never overwrite your shadcn/ui components.

- **Free items (MIT):** components, blocks, templates and themes, each with examples, accessibility notes and RTL support. Everything in this repository is free and MIT licensed.
- **Pro (commercial, separate licence):** 150 premium blocks in a private registry behind a licence key (`@ballmac-pro`), two starter apps (Beacon SaaS and Quire, an AI assistant that cites its sources) and the Figma token kit. Pro source is not in this repository. See [pricing](https://ui.ballmac.com/pricing).
- **AI ready:** `llms.txt`, per-item JSON at `/api/v1/items/*` and the [`@ballmac/mcp`](packages/mcp) server:

```bash
claude mcp add ballmac -- npx -y @ballmac/mcp
```

Docs and the full catalogue: https://ui.ballmac.com. Release notes: [`CHANGELOG.md`](CHANGELOG.md).

## Repository

| Path | What |
|---|---|
| `registry/ballmac/` | Item source. Paths mirror install locations: `components/x.tsx` installs to `@components/ballmac/x.tsx` |
| `registry/ballmac/**/<name>.meta.ts` | Item metadata: the single source of truth for the registry, site, search, llms.txt and MCP |
| `registry/examples/` | Examples, published as `registry:example` items |
| `packages/metadata/` | The metadata schema (`schema.ts`) |
| `apps/www/` | The website, registry hosting (`/r/*.json`) and `llms.txt` |
| `scripts/` | Registry build and quality checks |

## Commands

Uses pnpm (`npx pnpm@10` works without a global install).

```bash
pnpm install
pnpm build:registry   # validate metadata, generate registry.json, run `shadcn build`, write site data
pnpm check            # dependency truth, license provenance, output schema validation
pnpm smoke            # install every item into a fresh Next.js app, then tsc + next build
pnpm a11y             # axe every /preview/* page in light and dark; requires a Next build
pnpm dev              # website on http://localhost:3000
```

`pnpm a11y alert card` limits the scan to matching preview names. Set
`A11Y_BASE_URL` to scan an already running site; otherwise the script starts
`next start` on port 3301. Run `(cd apps/www && npx next build)` first.
On a new machine, install the browser once with
`npx -y pnpm@10 exec playwright install chromium`.

## Adding an item

1. Write the source under `registry/ballmac/components/` (import `cn` from `@/lib/utils`, other items from `@/components/ballmac/...`).
2. Add `<name>.meta.ts` next to it with `defineItem({...})`: description, category, dependencies, examples, AI notes, and `source` if any code came from elsewhere.
3. Add examples under `registry/examples/`.
4. Run `pnpm build:registry && pnpm check && pnpm smoke && pnpm a11y`.

## Contributing and security

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Report vulnerabilities privately as
described in [`SECURITY.md`](SECURITY.md). For help with an item, a bug that is not a security problem, or a Pro licence or purchase,
use [ui.ballmac.com/support](https://ui.ballmac.com/support) or open an issue.

## License

Free components, blocks, templates and the MCP server are MIT licensed (see [`LICENSE`](LICENSE)). See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for credited sources. Ballmac UI Pro is licensed separately.
