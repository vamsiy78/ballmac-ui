---
title: "Chat kit parts, an open registry score and server-side search"
date: 2026-10-19
seq: 2
tags: [components, CLI, docs]
summary: "Trace, Questionnaire and Code Block now match shadcn's chat kit, any registry can be scored with one command, and shadcn search returns ranked results from our server."
shot: /verified
imageAlt: "The Ballmac Verified page, with the registry score, grade and badge."
---

### New

- `trace`, `questionnaire` and the compound `code-block` have the same parts and props as shadcn's chat kit, so an agent's steps, questions and output drop into a chat built with either library. A trace row shimmers while it runs and opens to a code block with the command's output, and the questionnaire is built on shadcn's headless one, with letter shortcuts, multiple choice and your own validation. See [Use Ballmac with the shadcn chat kit](/docs/guides/shadcn-chat-kit).
- `ballmac verify` scores any shadcn registry on accessibility, theme tokens, declared dependencies, states, motion and right-to-left support, and writes a scorecard and a "Ballmac Verified" badge. Our own registry is scored the same way on the [Ballmac Verified](/verified) page, which also has a leaderboard other registries can join.
- A GitHub Action, `vamsiy78/ballmac-ui/actions/verify`, runs the score in CI and can fail a pull request under a minimum. See [Verify your registry](/docs/guides/verify-your-registry).
- `shadcn search @ballmac` now returns ranked results from our server. Ask `/r/registry.json?q=data+grid` for the matches with a `pagination` object, instead of downloading the whole catalog.

### Improved

- `code-block` has a header, title, actions, copy button, footer, diff and highlighted lines, `size="sm"` for tool output, `variant="destructive"` for errors and a `useHighlightedCode` hook. The ready-made panel (`code`, `filename`, `language`) works as before.
