---
title: "Ten agent primitives, eight operations screens, seven industry screens, and a way to contribute"
date: 2026-10-24
seq: 1
tags: [components, pro, docs]
summary: "Ten primitives for agent products, eight screens for running a product, seven for specific trades, a public Pro changelog and a guide to contributing."
shot: /preview/agent-lanes-demo
imageAlt: "Agent Lanes: four agents in rows, their steps coloured by kind, dashed handoffs between rows and a Now line."
---

### New

- `agent-lanes` is a swimlane timeline for runs with several agents: one row per agent, steps coloured by what they are doing, dashed handoffs between rows, a Now line and a detail panel. Every step is reachable with the arrow keys.
- `parallel-attempts` compares several runs of the same task side by side and has a native radio group to pick the one to continue with. `run-replay` replays a recorded run with a scrubber, markers and speeds, and drives anything on the page from one clock.
- `autonomy-dial` sets how much an agent may do on its own, from suggest-only to full auto, with what it does alone and what it stops to ask about written out. `permission-grid` sets Allow, Ask or Deny for each tool, with risk in words and presets.
- `run-ledger` breaks a run's time, tokens and cost down by step with a budget meter. `citation-coverage` shows an answer claim by claim, with the unsupported ones marked in words. `guardrail-feed`, `handoff-card` and `agent-roster` complete the set.
- Operations blocks: `audit-1` (an audit log you can search and export), `access-1` (a quarterly access review), `oncall-1` (a weekly rota), `incident-1` (an incident page with roles and updates), `pipeline-1` (a deploy pipeline with an approval gate), `queues-1` (job queues and failed jobs), `slo-1` (error budgets) and `cron-1` (scheduled jobs in plain words).
- Industry blocks: `clinic-1` (a day schedule with a privacy mode), `kitchen-1` (a kitchen display), `matter-1` (legal matters and deadlines), `listing-1` (a property page with a viewing form), `booking-1` (a class timetable), `workorder-1` (a repair job) and `dispatch-1` (a field-service board).

### Improved

- [Contribute](/contribute) explains the path from idea to merged pull request, the standard every item meets and where help is wanted, with issue forms to propose an item or show a project.
- The [Pro changelog](/pro/changelog) lists every new block, update and starter in Ballmac UI Pro with its date and version.
- The pricing page now has a Team plan for up to ten people, and a refund policy: if a Pro item does not work as its page says and cannot be fixed within 14 days of your request, you get a full refund.
