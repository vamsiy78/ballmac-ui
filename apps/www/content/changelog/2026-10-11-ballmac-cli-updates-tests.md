---
title: "Update components without losing your edits"
date: 2026-10-11
tags: [CLI, MCP, components, docs]
summary: "The new ballmac CLI merges new versions into your edited copies, and installs the tests that ship with components."
shot: file:cli-update.html
imageAlt: "A terminal running ballmac outdated, which lists three items behind with a note on what changed, then ballmac update, which merges your edits and flags one conflict."
---

### New

- `npx @ballmac/cli` runs the shadcn CLI for you and remembers what it installed (`ballmac.lock.json`), so `ballmac update` merges a new version into your edited copy: untouched files are replaced, edits elsewhere are merged and overlapping edits become conflict markers. See [Update components without losing your edits](/docs/guides/update-components).
- `ballmac outdated` lists what is behind with a note on what changed, `ballmac diff` shows your own changes, and `ballmac track` adopts items you installed with plain shadcn. Originals are backed up first and `--dry-run` previews everything.
- 200 free items ship with the test we run on them: `ballmac add dialog --with-tests` installs it next to the component, with the packages it needs and a vitest config if you have none. See [Install the tests](/docs/guides/tests).
- The [MCP server](/docs/reference/mcp-tools) gets `get_changes` (what changed since a version, breaking changes flagged) and `get_tests`.

### Improved

- Every item has a version and a changelog written for people who customised the file; component pages show them under What changed.
- A build check fails when an item's files change without a version bump and a changelog entry.
