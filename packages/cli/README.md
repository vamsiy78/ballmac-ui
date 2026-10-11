# @ballmac/cli

Update [Ballmac UI](https://ui.ballmac.com) components **without losing your edits**, and install the tests that ship with them.

Copy-paste libraries give you the code once. When the library later fixes a bug, your copy never gets it, and re-adding the component overwrites
what you changed. `ballmac` sits next to the shadcn CLI, remembers what it installed, and merges new versions into your edited copies.

```bash
npx @ballmac/cli add dialog --with-tests   # install (through shadcn) and start tracking
npx @ballmac/cli outdated                  # what is behind, and what changed
npx @ballmac/cli update --dry-run          # preview
npx @ballmac/cli update                    # merge new versions into your files
```

## Commands

| Command | |
|---|---|
| `add <item…>` | Install items with shadcn and track them. `--with-tests` also installs their tests. |
| `outdated [item…]` | Items with a newer version, whether you edited them, and the changelog notes. `--json`, `--exit-code` (fails when behind, for CI). |
| `update [item…]` | Merge new versions into your copies. `--dry-run` shows the plan and writes nothing. |
| `diff <item>` | What you changed since you installed it. |
| `track [item…]` | Adopt items you installed with plain `shadcn add`. `--rebase <item>` declares your files current. |
| `test [item…]` / `test add <item…>` | Run the installed Ballmac tests / install tests for items you already have. |

## How updates work

On install, `ballmac` writes `ballmac.lock.json` and keeps an untouched copy of each file in `.ballmac/base/`. **Commit both.** That copy is the
"base" of a three-way merge: what you changed is the difference between it and your file, and what Ballmac changed is the difference between it and
the new version.

- A file you never touched is replaced.
- A file you edited is merged. Both sets of changes are kept.
- If you and Ballmac changed the same lines, the file gets git-style conflict markers (`<<<<<<< yours` … `>>>>>>> ballmac 1.1.0`).
- A file you deleted stays deleted. New files and new dependencies a version adds are installed and tracked.
- Before anything is written, every file it might change is copied to `.ballmac/backup/` (git-ignored). If shadcn fails halfway, your files are put back.

The new upstream file is obtained from `shadcn add <item> --dry-run --view`, so it carries exactly the rewrites shadcn applies for your project
(aliases, icon library, base library, RTL). The preview is parsed strictly and checked against its own line counts; if shadcn's output ever changes
shape, the tool stops instead of guessing.

## Tests

Most free components ship with the test we run on them (vitest + Testing Library). `--with-tests` installs it as `__tests__/<item>.test.tsx` next to
the component, with a shared `setup.ts`, the packages it needs (pinned to versions known to work together) and, if you have no vitest config, one that
maps your `@` alias. Tests are updated with the component and merged like any other file. Pro blocks are tested in batches, so they do not ship
per-item tests yet.

## Pro

Set `BALLMAC_LICENSE_KEY` in your environment or `.env.local`. Without it only free items are listed. The `@ballmac-pro` registry entry is added to
`components.json` the first time you add a Pro item.

## Requirements and limits

- Node.js 20 or later, and a project with `components.json` (`npx shadcn@latest init`).
- Merging uses `git merge-file` (no repository needed, but `git` must be on your PATH). Without it, edited files get the new version beside them as `<file>.ballmac-new`.
- Files tracked **without a base** (they already existed and differed from the registry) are never merged: the new version goes beside them.
- A clean merge can still be wrong in meaning. Run the tests, and read the changelog note.
- Themes are CSS variables, not files, and are not merged.

## Environment

| Variable | |
|---|---|
| `BALLMAC_UI_URL` | Registry to read (default `https://ui.ballmac.com`). |
| `BALLMAC_LICENSE_KEY` | Your Ballmac UI Pro key. |
| `BALLMAC_SHADCN` | How to run shadcn, for example `pnpm dlx shadcn@latest` (default: your local copy, else the package manager's runner). |

Docs: https://ui.ballmac.com/docs/cli · MIT licensed.
