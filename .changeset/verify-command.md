---
"@ballmac/cli": minor
---

Adds `ballmac verify`. Point it at a shadcn registry (a URL, a folder or a `registry.json`) and it scores the source on accessibility, theme tokens, declared dependencies, states, motion and right-to-left support, then writes a scorecard and a "Ballmac Verified" SVG badge. `--min-score` fails CI under a threshold. It needs TypeScript in the folder it runs from.
