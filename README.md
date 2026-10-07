# Ballmac UI

[![CI](https://github.com/vamsiy78/ballmac-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/vamsiy78/ballmac-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm @ballmac/mcp](https://img.shields.io/npm/v/@ballmac/mcp?label=%40ballmac%2Fmcp)](https://www.npmjs.com/package/@ballmac/mcp)
[![M8ven Verified](https://m8ven.ai/badge/mcp/vamsiy78/ballmac-ui?variant=verified)](https://m8ven.ai/mcp/vamsiy78/ballmac-ui?s=readme)
[![shadcn registry](https://img.shields.io/badge/shadcn-registry-black)](https://ui.shadcn.com/docs/directory)

Accessible React + Tailwind v4 components, blocks and templates in one design language. You add what you need with the
[shadcn](https://ui.shadcn.com) CLI and the source lands in your project, ready to read and change. Your AI coding agent can search and
install them too, through MCP. Now listed in the official [shadcn registry directory](https://ui.shadcn.com/docs/directory).

**Site and docs: [ui.ballmac.com](https://ui.ballmac.com)**

## What is in it

- **240+ components:** primitives, forms, data display, navigation, feedback, motion, backgrounds, text effects, AI interfaces, developer
  tools, device frames and desktop-style surfaces.
- **60+ blocks and 17 templates:** heroes, pricing, dashboards, sign-in, settings and more, composed from the components.
- **12 themes** with a live builder, light and dark.
- **Built to a standard:** every item has examples, keyboard support, reduced-motion handling, right-to-left support and one translation
  provider for its built-in text. See [`AUTHORING.md`](AUTHORING.md).
- **Made for AI agents:** each item carries a description, when to use it and when not to, what it composes with, and keyboard notes. Available
  through [`llms.txt`](https://ui.ballmac.com/llms.txt), a JSON API and the [`@ballmac/mcp`](packages/mcp) server.
- **No collisions:** everything installs into `components/ballmac/`, so it never overwrites your shadcn/ui files.
- **Verified installs:** the release check installs every item into a fresh Next.js app, then type-checks and builds it.

## Quick start

You need a project with React 19, Tailwind CSS v4 and shadcn set up (`npx shadcn@latest init`; it creates `components.json`). Both the Base UI and
Radix styles work.

```bash
# add components by name; npm dependencies are installed for you
npx shadcn@latest add @ballmac/button @ballmac/dock
```

```tsx
import { Button } from "@/components/ballmac/button"
```

`@ballmac` is in the official shadcn registry directory, so there is no registry to configure. On an older CLI, or to pin the address, run `npx shadcn@latest registry add "@ballmac=https://ui.ballmac.com/r/{name}.json"` once, or install by URL: `npx shadcn@latest add https://ui.ballmac.com/r/button.json`. Browse and preview everything at
[ui.ballmac.com/components](https://ui.ballmac.com/components), and see the [installation guide](https://ui.ballmac.com/docs/installation) for
the optional Ballmac theme.

## Use it with an AI agent

```bash
claude mcp add ballmac -- npx -y @ballmac/mcp
```

The server is read-only and needs no account. It searches the catalog, returns props, keyboard behaviour and source, gives the exact install
command, and can plan a whole page from blocks. Setup for Cursor, VS Code, Windsurf, Codex and Claude Desktop is in the
[MCP docs](https://ui.ballmac.com/docs/mcp) and in [`packages/mcp`](packages/mcp). The official shadcn MCP server also works with this registry.

## Free and Pro

| | Free (this repository) | Pro |
| --- | --- | --- |
| Components, blocks, templates, themes | All of them, MIT licensed | Everything in Free |
| Premium blocks | | 150 more: heroes, features, pricing, dashboards, app screens, ecommerce, content and more |
| Starter apps | | Beacon SaaS (teams, Stripe billing, dashboard) and Quire (an AI assistant that cites its sources) |
| Design tokens | | Figma tokens for every theme |
| How you get it | `shadcn add @ballmac/...` | A private registry (`@ballmac-pro`) with a licence key, or log in on the site to copy code and download the starters |

Pro is commercial and licensed separately: its source is not in this repository. Details and pricing at
[ui.ballmac.com/pricing](https://ui.ballmac.com/pricing), setup at [ui.ballmac.com/docs/pro](https://ui.ballmac.com/docs/pro).

## Repository

| Path | What |
| --- | --- |
| `registry/ballmac/` | Item source. Paths mirror install locations: `components/x.tsx` installs to `@components/ballmac/x.tsx` |
| `registry/ballmac/**/<name>.meta.ts` | Item metadata: the single source of truth for the registry, site, search, `llms.txt` and MCP |
| `registry/examples/` | Examples, published as `registry:example` items |
| `packages/metadata/` | The metadata schema |
| `packages/theme-engine/` | Theme presets and the colour engine behind the theme builder |
| `packages/mcp/` | The `@ballmac/mcp` server |
| `apps/www/` | The website, registry hosting (`/r/*.json`), the JSON API and `llms.txt` |
| `scripts/` | Registry build and quality checks |
| `.github/` | CI, the MCP release workflow, issue and pull request templates |

## Develop

Needs Node.js 22 (what CI runs) and pnpm 10 (the repo pins it; `corepack enable` installs the right version, or use `npx pnpm@10`). The Pro registry is
optional: without it the site builds with the free items only.

```bash
pnpm install
pnpm build:registry   # validate metadata, generate registry.json, run `shadcn build`, write site data
pnpm dev              # website on http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `pnpm check` | Dependency truth, licence provenance, RTL and translation checks, output schema validation |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` | The usual |
| `pnpm smoke` | Install every item into a fresh Next.js app, then `tsc` and `next build` (needs network access to ui.shadcn.com) |
| `pnpm a11y [name…]` | axe on every `/preview/*` page in light and dark; run `(cd apps/www && npx next build)` first, and install the browser once with `pnpm exec playwright install chromium` |

`A11Y_BASE_URL` points the accessibility scan at a site that is already running.

## Add an item

1. Write the source under `registry/ballmac/components/` (import `cn` from `@/lib/utils`, other items from `@/components/ballmac/...`).
2. Add `<name>.meta.ts` next to it with `defineItem({...})`: description, category, dependencies, examples, notes for AI agents, and `source` if any
   code came from elsewhere.
3. Add examples under `registry/examples/`.
4. Run `pnpm build:registry && pnpm check && pnpm smoke && pnpm a11y <name>`.

[`AUTHORING.md`](AUTHORING.md) is the full standard.

## Contributing, support and security

- Contributions are welcome: read [`CONTRIBUTING.md`](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md).
- Bugs and requests: open an issue. Questions, or help with an item, a purchase or a licence key: [ui.ballmac.com/support](https://ui.ballmac.com/support).
- Security problems: report them privately as described in [`SECURITY.md`](SECURITY.md).
- Release notes: [`CHANGELOG.md`](CHANGELOG.md) and [ui.ballmac.com/changelog](https://ui.ballmac.com/changelog).

## License

Free components, blocks, templates and the MCP server are MIT licensed (see [`LICENSE`](LICENSE)). [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)
credits the open-source work they build on. Ballmac UI Pro is licensed separately.
