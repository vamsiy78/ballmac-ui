---
title: "Answers you can check, a memory you control, and evals for prompt changes"
date: 2026-10-25
seq: 5
tags: [components, docs]
summary: "An answer where every claim cites its source, a memory panel people can correct, a decision trace, an eval scorecard and a source manager, in three new screens."
shot: /preview/agent-16-demo
imageAlt: "An answer workspace: a question, an answer with numbered source buttons and a source list, and a memory panel on the right."
---

### New

- `cited-answer` is an AI answer you can check. The numbers in the text are real buttons: choose one and every claim that source supports is highlighted and its excerpt opens, and choosing a source in the list works the other way round. It says how many sentences are cited.
- `memory-panel` shows what an assistant remembers as plain sentences that can be searched, edited in place, pinned or forgotten, with Undo. One switch stops replies using memory without deleting any of it.
- `decision-trace` shows why an agent picked one path over the others, with fit scores, reasoning, pros and cons, and a button for a person to choose another option.
- `eval-scorecard` shows how a model or prompt did on a set of cases: the pass rate and its change from the baseline in words, what got worse or was fixed, and each case opened to show what was asked, a good answer and what the model said. `knowledge-sources` manages what an assistant reads, with sync progress, a failed sync with Retry and a switch for each source.
- Blocks that put them together: `agent-16` (an answer workspace with memory), `agent-17` (a prompt evaluation with the prompt diff) and `agent-18` (a knowledge base with a test question).
