---
title: "Timelines, org charts and privacy settings"
date: 2026-10-18
seq: 7
tags: [blocks, MCP]
summary: "A project timeline, an org chart, data and privacy settings, customer stories and an integrations directory."
shot: /preview/gantt-1-demo
imageAlt: "The Gantt 1 block, a project timeline with bars, milestones and dependency arrows."
---

### New

- [Gantt 1](/blocks/gantt-1) places bars by real dates with progress, milestones, dependency arrows (a task that starts before what it waits for shows its arrow backwards), a today line, three zoom levels and a hidden table for screen readers; late work shows an icon and the word Late.
- [Org chart 1](/blocks/orgchart-1) draws connected person cards with a count toggle per team, search that opens the path to a person, and the standard tree keys; connectors and keys mirror in right to left.
- [Settings 6](/blocks/settings-6) handles data and privacy: request an export in JSON or CSV with a labelled progress bar, set how long messages are kept, and delete the account behind a typed email with a 30-day grace period you can cancel.
- [Case study 1](/blocks/casestudy-1) features one story with its quote and results counting up, a grid of the others with a headline number each, an industry filter, and pictures drawn from each company's name, so no image files are needed.
- [Integrations 1](/blocks/integrations-1) lists integrations with highlighted search, category counts that follow the search, "Connected" in words, and a side sheet whose Connect button handles the wait and a failure.

### Improved

- The [MCP server](/docs/reference/mcp-tools) finds the new groups for gantt, schedule, orgchart, hierarchy, privacy, gdpr, export, customers and marketplace.
- All five pass every scorecard check, including 360 px (checked to 320 px), reduced motion and right to left (the Gantt timeline runs left to right in every language, like a chart), and ship their tests.

### Fixed

- The hidden usage table in [Dev 1](/blocks/dev-1) is now wrapped so it can never widen the page on a phone.
