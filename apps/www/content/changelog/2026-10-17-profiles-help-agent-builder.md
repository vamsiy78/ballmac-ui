---
title: "Profiles, help centers and agent builders"
date: 2026-10-17
seq: 4
tags: [blocks, components, MCP]
summary: "A public profile, a help center home, assistant memory, an agent builder and generated cover art."
shot: /preview/agent-7-demo
imageAlt: "The Agent 7 block, an agent builder with a tool permission list and a live preview."
---

### New

- [Profile 1](/blocks/profile-1) is a public profile with a verified badge, a Follow button that updates the count at once and undoes itself if it fails, counting stats, project cards and an Activity tab with a contribution graph.
- [Help 1](/blocks/help-1) is a help center home with a hero search that suggests articles as you type (arrow keys, Enter, Escape, and / from anywhere), topic cards, popular articles and a contact strip that stays even when the guides fail to load.
- [Agent 6](/blocks/agent-6) shows what an assistant remembers in a three-ring chart, with a pause switch, memories you edit, pin or forget (seven seconds to undo) and Forget everything behind a confirmation.
- [Agent 7](/blocks/agent-7) builds an agent: instructions, a model, each tool set to off, ask first or allowed (tools that change data start at ask first), knowledge, guardrails and a live preview that follows every setting.
- [cover-art](/components/cover-art) draws cover pictures from a seed in your theme's chart colors. The same seed always draws the same picture, with plain arithmetic so server and browsers agree; Profile 1, Help 1 and Agent 7 use it as the fallback for images you have not set.

### Improved

- The [MCP server](/docs/reference/mcp-tools) finds the new groups for profile, help, support, memory, builder and cover.
- All pass every scorecard check, including 360 px, the right-to-left mirror and reduced motion, and ship their tests.
