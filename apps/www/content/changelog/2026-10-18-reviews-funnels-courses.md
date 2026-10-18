---
title: "Reviews, A/B results and funnels"
date: 2026-10-18
seq: 9
tags: [blocks, MCP]
summary: "Customer reviews, test results with real statistics, a conversion funnel, a locations finder and a course page."
shot: /preview/experiments-1-demo
imageAlt: "The Experiments 1 block, A/B variants with their conversion rates and confidence intervals on one axis."
---

### New

- [Reviews 1](/blocks/reviews-1) works the average, every star bar and the share of 4 and 5 stars out of the reviews, filters by bar, sorts, and counts helpful votes at once; drawn stars read as "4 out of 5 stars".
- [Experiments 1](/blocks/experiments-1) plots each variant's conversion rate with its 95% confidence interval, the lift, the chance it beats the control and a plain verdict, including "not enough data" with the visitors still needed; certainty is never shown as 100%.
- [Funnel 1](/blocks/funnel-1) sizes bars against the first step, shows the share kept and people lost at each step, and writes the biggest leak out as a sentence with what winning some back is worth.
- [Locations 1](/blocks/locations-1) puts a pressable pin on a dotted world map for every place, with a searchable list and a card that says whether it is open now in the place's own time zone.
- [Course 1](/blocks/course-1) shows a progress ring, a Continue button for the next lesson, modules with their own progress, locked lessons that say why, and a certificate that unlocks when every lesson is done.

### Improved

- The [MCP server](/docs/reference/mcp-tools) finds the new groups for ratings, conversion, abtest, stores, locator, offices, lessons, curriculum and lms.
- All five pass every scorecard check, including 360 px (checked to 320 px), reduced motion and right to left (the chart axes in Experiments 1 stay left to right), and ship their tests.
