---
title: "A queue, a grid for batch runs, a review desk and three more agent screens"
date: 2026-10-25
seq: 4
tags: [components, docs]
summary: "See a whole batch at a glance and retry only what failed, reorder what runs next, review what agents made from the keyboard, and polish a draft with suggestions you accept one by one."
shot: /preview/agent-14-demo
imageAlt: "A batch run: a grid of 48 invoice tiles marked done, running or failed on the left, and the queue of what runs next on the right."
---

### New

- `fan-out-grid` shows many things done at once as tiles, one per file or record, marked by state with an icon and a word, with filters, arrow-key movement in every direction and Retry for the ones that failed. `agent-queue` shows what an agent will do next, with real buttons to move, pause, prioritise and cancel.
- `review-center` is a desk for what agents made: the agent's confidence, the thing itself, Approve or Request changes, and J, K, A and R keys so a person can go fast. Decisions show at once and are taken back with the reason if saving fails.
- `writing-assistant` shows suggested edits in place, with a different underline for each kind, and Accept, Dismiss and Accept all. `prompt-library` is a shelf of saved prompts with labelled fields for their {{variables}}. `message-actions` is the small bar under an AI reply: copy, try again, good or bad answer with a reason, branch and share.
- Blocks that put them together: `agent-13` (review desk), `agent-14` (batch run) and `agent-15` (draft studio).
