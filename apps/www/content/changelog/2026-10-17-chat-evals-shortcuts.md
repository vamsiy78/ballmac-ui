---
title: "Team chat, evals and shortcut editing"
date: 2026-10-17
seq: 3
tags: [blocks, components, MCP]
summary: "A team chat, eval results, a desktop welcome window and a keyboard shortcuts editor."
shot: /preview/chat-1-demo
imageAlt: "The Chat 1 block, team chat with channels, direct messages and a thread panel."
---

### New

- [Chat 1](/blocks/chat-1) is team chat with channels and direct messages, unread counts and presence, a New divider, reactions, threads in a side panel, @mentions, and messages that show while sending and offer Retry when they fail.
- [Agent 5](/blocks/agent-5) shows eval results: a verdict that calls out cases that passed before and fail now, each metric against the baseline with Better or Worse in words, and answers side by side or as a diff.
- [Desktop 7](/blocks/desktop-7) is a welcome window with the app's name and version, ways to start (new, open, clone) with shortcuts in the platform's notation, and recent projects you search, open and remove.
- [Desktop 8](/blocks/desktop-8) edits keyboard shortcuts: commands searchable by name or by pressing the keys, a recorder per row, a Replace warning when a combination is taken, and Restore defaults; it saves only what differs from the defaults.
- [shortcut](/components/shortcut) adds `formatShortcut`, `shortcutFromEvent` and `normalizeShortcut`, shared by Desktop 1, 7 and 8. Option+letter on a Mac records the letter rather than its symbol.

### Improved

- [Desktop 1](/blocks/desktop-1) is 1.0.1 and installs the shortcut lib; its behaviour is unchanged.
- The [MCP server](/docs/reference/mcp-tools) finds them for slack, channels, messaging, evals, welcome, hotkeys and keybindings.
- All pass every scorecard check and ship their tests.
