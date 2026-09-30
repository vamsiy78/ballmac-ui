# Agent instructions for Ballmac UI

Start with `HANDOVER.md` (current state, goal, research bar, roadmap, workflow), then follow `AUTHORING.md` for every item you write. Every component must be researched against shadcn, Magic UI, Aceternity, DaisyUI and the rest, and end up better than all of them (HANDOVER.md section 2b).

Non-negotiables:

- Reuse code only from MIT, ISC, BSD or Apache-2.0 projects, with the "Based on" header line and `meta.source` filled. Never copy from Aceternity, Tailwind Plus, any Pro or paid kit, or anything without a clear license.
- Work on `preprod`; never push to `main` (production) unless the owner asks.
- Before each commit, the batch gate in `HANDOVER.md` section 5 must pass.
- No `asChild` in JSX, tokens only, keyboard and reduced-motion support on every item.
- Next.js here is version 16; check `apps/www/node_modules/next/dist/docs/` before relying on older Next APIs.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
