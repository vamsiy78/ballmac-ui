---
title: "A run workbench, mission control and six new agent components"
date: 2026-10-25
seq: 3
tags: [components, docs]
summary: "Steer an agent while it works, see its plan against what happened, watch its memory fill, and oversee a whole team of agents with spend and approvals in one place."
shot: /preview/agent-11-demo
imageAlt: "A run workbench: the conversation with tool calls as cards on the left, and the plan and context meter on the right."
---

### New

- `agent-11` is a run workbench: the conversation with each tool call as an openable card, a live plan, a context meter and a steering box, with Stop and honest failures. `agent-12` is mission control for a team of agents: spend, tokens, running agents, the delegation tree and an inbox of approvals.
- `agent-steering` redirects an agent mid-run (now, after this step or at the end) and shows each instruction going from queued to applied. `plan-tracker` shows a plan against what happened, including steps the agent added or skipped.
- `context-window` shows what fills an agent's memory and warns before it overflows. `agent-tree` shows who delegated to whom, with rolled-up progress and cost. `model-compare` sets models side by side by intelligence, speed and cost. `thinking-loader` is a small working pill for AI replies.

### Improved

- `tool-call-card` gets a status strip, a server tag, an icon tile, keys and values for flat inputs, Copy, a moving line while running, a Denied status and Retry on a failed call.
- `autonomy-dial`, `trace-waterfall`, `agent-lanes`, `agent-graph`, `parallel-attempts`, `tool-catalog` and `escalation-card` get richer headers, costs, models, icons, risk badges and meters. Every component page now has a Copy prompt button for your coding agent.
