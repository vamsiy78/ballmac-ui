# Agent instructions for Ballmac UI

Start with `HANDOVER.md` (current state, goal, roadmap, workflow), then follow `AUTHORING.md` for every item you write.

Non-negotiables:

- Reuse code only from MIT, ISC, BSD or Apache-2.0 projects, with the "Based on" header line and `meta.source` filled. Never copy from Aceternity, Tailwind Plus, any Pro or paid kit, or anything without a clear license.
- Work on `preprod`; never push to `main` (production) unless the owner asks.
- Before each commit, the batch gate in `HANDOVER.md` section 5 must pass.
- No `asChild` in JSX, tokens only, keyboard and reduced-motion support on every item.
- Next.js here is version 16; check `apps/www/node_modules/next/dist/docs/` before relying on older Next APIs.
