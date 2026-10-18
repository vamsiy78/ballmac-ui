---
title: "AI agent blocks and the audit log"
date: 2026-10-17
seq: 2
tags: [blocks, MCP]
summary: "Four blocks for products where agents do the work and people stay in charge, plus an integrations directory and an audit log."
shot: /preview/agent-2-demo
imageAlt: "The Agent 2 block, an approvals inbox with a risk label on each request."
---

### New

- A new AI agents group opens the catalog beyond chat blocks, with four free blocks.
- [Agent 1](/blocks/agent-1) shows a live run: the task and its status ("Waiting for you" is announced), the plan, every note, tool call and approval in order, Stop, Run again and a follow-up box.
- [Agent 2](/blocks/agent-2) is an approvals inbox with risk, the full request beside the list, A and D to approve or deny, J and K to move, and one button for every low-risk request.
- [Agent 3](/blocks/agent-3) lists runs with status, time, tokens and cost, and a waterfall of model, tool and retrieval calls in which a failed span opens first; [Agent 4](/blocks/agent-4) compares one prompt on two models with `{{variables}}` as fields, ⌘Enter to run, ratings and Pick this one.
- [Settings 4](/blocks/settings-4) is an integrations directory with Connect progress and failure reasons, and Disconnect after a confirmation.
- [Settings 5](/blocks/settings-5) is an audit log of who changed what (people, agents, API keys, the system), filterable, with a before-and-after diff per event and a CSV export.

### Improved

- All six have loading, empty and error states (the playground has running and error), pass every scorecard check and ship their tests.
- The [MCP server](/docs/reference/mcp-tools) finds them for agent, approval, trace, observability, playground, audit and integrations.
