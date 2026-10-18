---
title: "Tickets, webhooks and feature flags"
date: 2026-10-18
seq: 11
tags: [blocks, MCP]
summary: "Developer and support surfaces: a ticket thread, a webhooks manager, flags, an automation builder and an API explorer."
shot: /preview/flags-1-demo
imageAlt: "The Flags 1 block, a feature flags manager with a switch for each environment."
---

### New

- [Tickets 1](/blocks/tickets-1) shows the customer conversation with replies and private notes (dashed, tinted and labelled so a note is never mistaken for a reply), a reply timer, canned replies, and Retry for a message that fails to send.
- [Webhooks 1](/blocks/webhooks-1) rates each endpoint from its last ten deliveries, masks the signing secret, and logs every delivery with status, timing, payload, the endpoint's answer and Send again.
- [Flags 1](/blocks/flags-1) has a switch per environment, a rollout slider that applies on Save, flags fully on for months marked ready to remove, and a confirmation that says exactly who is affected before Production changes.
- [Workflow 1](/blocks/workflow-1) builds a trigger plus conditions, waits and actions you add, reorder and delete, and a test run that shows each step as ran fine or where and why a condition stopped it.
- [API 1](/blocks/api-1) explores an API: method, address, headers and JSON body in, status in words, time, size and a body tree out, with history, Copy as cURL and a built-in demo API so it works with no server.

### Improved

- The [MCP server](/docs/reference/mcp-tools) finds the new groups for helpdesk, sla, rollout, trigger, postman and explorer.
- All five pass every scorecard check, including 360 px (checked to 320 px), reduced motion and right to left (code in Webhooks 1 and API 1 stays left to right), and ship their tests.
