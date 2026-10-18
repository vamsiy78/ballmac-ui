---
title: "Galleries, trust centers and leaderboards"
date: 2026-10-18
seq: 6
tags: [blocks, components, MCP]
summary: "A filterable gallery, a company story, a trust center, a task list and a leaderboard, plus a hook that fixes lost focus in dialogs."
shot: /preview/gallery-1-demo
imageAlt: "The Gallery 1 block, a masonry of tiles with category chips above it."
---

### New

- [Gallery 1](/blocks/gallery-1) is a filterable masonry with category chips and a lightbox (counter, thumbnail strip, arrow-key and swipe navigation, mirrored in right to left); tiles without a picture show art drawn from their id.
- [About 1](/blocks/about-1) tells a company story with a two-tone statement, counting numbers, a pull quote, value cards, a milestone timeline and a closing call to action; pass `[]` or `null` to leave a part out.
- [Trust 1](/blocks/trust-1) lists certifications with dates, security controls with what is still in progress, documents behind a validated request form, a subprocessor table, and a disclosure contact that stays visible if the page fails to load.
- [Tasks 1](/blocks/tasks-1) groups tasks as overdue, today, upcoming and no date with due dates in words, edits inline, reorders with buttons or Alt and the arrow keys, has shortcuts (N, X, E, J, K) and Undo on delete; pass today in.
- [Leaderboard 1](/blocks/leaderboard-1) shows a podium and ranked rows with bars against the leader, movement in words ("Up 2 places"), a week, month and all-time switch, and your own place pinned when you are further down.
- [return-focus](/components/return-focus) puts keyboard focus back where it was when a dialog closes. Radix returns focus only to a dialog's trigger, so a dialog opened from state dropped it to the top of the page; Gallery 1, Trust 1, Settings 4, Agent 6, Agent 8 and Dev 1 use it.

### Improved

- Cover art spreads its color fields across the full width, so a wide cover is never empty on one side.
- The [MCP server](/docs/reference/mcp-tools) finds the new groups for about, story, trust, compliance, gallery, lightbox, tasks, todo, leaderboard and ranking.

### Fixed

- Screen-reader-only text now sits beside its visible text with a real space, not inside the span, where some browsers drop it ("DownloadSecurity whitepaper"). Fixed in Trust 1, Inbox 1, Chat 1, Profile 1, Help 1, Agent 5 and Desktop 7.
