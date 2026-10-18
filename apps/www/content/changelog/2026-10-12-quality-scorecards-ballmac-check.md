---
title: "Quality, measured"
date: 2026-10-12
tags: [components, blocks, CLI, MCP, docs]
releases: ["@ballmac/mcp 1.4.0"]
summary: "Every item now has a scorecard measured in a real browser, and ballmac check holds your own app to the same bar."
shot: /components/button
shotSelector: 'section[aria-labelledby="quality"]'
imageAlt: "The quality scorecard on the Button page, listing each check that was measured in a real browser."
---

### New

- Every item page has a quality scorecard measured in a real browser: axe-core in light and dark, no sideways scrolling at 360, 390 and 1280 px, reduced motion, a right-to-left mirror, a clean console, a keyboard pass, states, tests and size. 477 items and 1,032 examples were loaded and the results are public at [/quality](/quality).
- [`ballmac check`](/docs/guides/check-your-app) reads your source (read-only, offline) and reports missing loading and error states, unnamed images and buttons, positive tabindex, hand-rolled dialogs, hard-coded colors, endless decorative motion and layouts that break on a phone, each with the fix; `--url` also loads your running app with your own Playwright and axe.
- The [MCP server](/docs/reference/mcp-tools) (1.4.0) has `get_quality_rules`, so an agent reads the rules before it writes a component, and `audit_project`, so it can check its work before it says it is done.

### Improved

- The measurement is honest about its limits: automated tools find only part of the accessibility problems, a loading spinner is kept turning on purpose, WCAG 2.2's 24 px target size is a note rather than a failure, and items not mirrored by design (code, charts, keyboard shortcuts) show their reason. See [what the check is and is not](/docs/concepts/quality).

### Fixed

- The first full run found 55 real failures: a table that stretched the page sideways on phones in five Pro blocks, skeletons wider than a 360 px screen, compact amounts written differently on server and browser (a hydration error in three dashboards), a map route that kept animating for visitors who asked for less motion, and a notification table keyboard users could not scroll while a save was running. The affected items have new versions that `ballmac update` merges into your copy.
