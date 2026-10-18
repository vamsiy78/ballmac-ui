---
title: "Search, notifications and uploads"
date: 2026-10-18
seq: 5
tags: [blocks, components, MCP]
summary: "A search results page, a notifications inbox, an upload manager, an agent knowledge manager and a developers page."
shot: /preview/search-1-demo
imageAlt: "The Search 1 block, a results page with a large search box and filters with live counts."
---

### New

- [Search 1](/blocks/search-1) is a results page with a search box (press / to reach it), type filters with live counts, a date filter and sort, highlighted words, Show more, and a no-results page that suggests a spelling.
- [Inbox 1](/blocks/inbox-1) groups notifications by day, answers requests in the list (Approve, Deny, Accept, Decline), supports J, K, E and U triage, and offers Undo after archiving.
- [Upload 1](/blocks/upload-1) validates files and says why each was refused, gives every file its own state (waiting, uploading with progress, done, or failed with the reason and Retry), previews images and cancels through an abort signal.
- [Agent 8](/blocks/agent-8) manages an agent's knowledge: a health bar across sources, sync progress or failure with retry, a switch for whether the agent may use each source, and a panel that shows which passages come back for a question.
- [Dev 1](/blocks/dev-1) is a developers page with a 14-day request chart, success rate and median time, API keys shown in full exactly once and revoked behind a confirmation, test and live modes, and a request log with copy as curl.
- [match-highlight](/components/match-highlight) marks the words of a search in text with real `mark` elements, with helpers to split a query and count matches. It works on the server and on Arabic and Hebrew text.

### Improved

- [Help 1](/blocks/help-1) now uses match-highlight instead of its own copy, with no change in behaviour.
- The [MCP server](/docs/reference/mcp-tools) finds the new groups for results, notifications, alerts, files, developer, logs, knowledge and rag.
- All pass every scorecard check, including 360 px (checked to 320 px), reduced motion and right to left, and ship their tests; the mirror check for match-highlight is marked not applicable, with the reason shown, because words in a line keep the order of their language.
