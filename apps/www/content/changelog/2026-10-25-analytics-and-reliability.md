---
title: "Seven data components and four report screens, and a phone-width fix pass"
date: 2026-10-25
seq: 6
tags: [components, docs]
summary: "A funnel, a gauge, a status-page tracker, a before-and-after chart, a rating summary, a ranked list and a split bar, put together in analytics, reliability, reviews and benchmark screens."
shot: /preview/analytics-1-demo
imageAlt: "An analytics page: four metrics with trends, a visit-to-purchase funnel with the biggest drop flagged, a top pages list with tabs and a device split."
---

### New

- `funnel-chart` shows steps that narrow, says how many carried on and how many dropped out between each pair, and flags the biggest drop in words. `bar-list` is a ranked list of bars with the name and the number on top of the bar, links or buttons for rows, and a fold for long lists.
- `gauge` is a half-circle with a needle, colored zones and a target. The value, the zone and the target are written as text. `uptime-tracker` is the status-page row with one cell per day, moved along with the arrow keys, with the day you are on written underneath.
- `dumbbell-chart` compares before and after for many things at once and says each change in words, such as up 8, better. `rating-distribution` shows the average and a bar for each star size that can filter the reviews. `split-bar` cuts one bar into shares with a legend that carries the numbers.
- Blocks: `analytics-1` (metrics, funnel, rankings and devices), `reliability-1` (service history, error budgets and incidents), `reviews-2` (ratings with themes and mood) and `benchmark-1` (two versions compared on quality, speed and cost).

### Fixed

- Several earlier screens no longer widen the page on a phone: `runbook-1`, `heat-grid` and `matrix-1`, `waterfall-chart` and `flow-sankey`. The floor plan in `floorplan-1` scrolls sideways in its own region instead of overlapping, and `treemap` keeps a minimum height.
