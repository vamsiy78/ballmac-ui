# Changesets

A changeset is a small note, one per change, that says which package changed, how big the change is and what to tell people. Releases collect them
into each package's `CHANGELOG.md` and bump its version. See "Changelog and releases" in `CONTRIBUTING.md`.

```bash
pnpm changeset            # write a note for the packages your change touches
pnpm version-packages     # at release time: apply the notes, bump versions, write CHANGELOG.md files
```

Packages covered: `@ballmac/cli`, `@ballmac/mcp` (published to npm) and `@ballmac-ui/registry` (the catalog, which is not published; its notes describe
items added or changed in ways the per-item changelogs don't cover). The audit engine is copied into the CLI and the MCP server, so a change to it needs a
note for both.
