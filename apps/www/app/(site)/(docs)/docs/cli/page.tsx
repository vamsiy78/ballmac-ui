import type { Metadata } from "next"

import Link from "@/components/site/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"

export const metadata: Metadata = {
  title: "Updates & tests",
  description: "Update Ballmac UI components without losing your edits, and install the tests that ship with them, with the @ballmac/cli command line tool.",
  alternates: { canonical: "/docs/cli" },
}

export default function CliPage() {
  return (
    <DocsPage
      title="Updates & tests"
      lead="Copy-paste libraries give you the code once, and then you are on your own: fix a bug upstream and your copy never gets it, re-add the component and you lose your edits. The ballmac command line tool remembers what it installed and merges new versions into your edited copies."
    >
      <h2>Install items with it</h2>
      <p>
        <code>ballmac</code> sits next to the shadcn CLI. shadcn still writes the files and installs packages; <code>ballmac</code> runs it for
        you and records what landed. Run it in a project that already has a <code>components.json</code>.
      </p>
      <CodePanel lang="bash" code={"npx @ballmac/cli add dialog --with-tests"} />
      <p>
        That installs <code>dialog</code> and the items it needs, then writes <code>ballmac.lock.json</code> and a <code>.ballmac</code> folder
        that holds an untouched copy of each file as it was installed. <strong>Commit both</strong>: the untouched copy is what makes merging possible,
        and your teammates and CI need it too.
      </p>

      <h2>See what is behind</h2>
      <CodePanel
        lang="bash"
        title="npx @ballmac/cli outdated"
        code={`ITEM    INSTALLED  LATEST  YOUR CHANGES          WHAT CHANGED
badge   1.0.0      1.1.0   none                  Slightly wider horizontal padding so short labels do not look cramped.
button  1.0.0      1.1.0   yes (will be merged)  The lg size is taller and larger so it matches the lg input and select.
dialog  1.0.0      1.1.0   yes (will be merged)  The overlay is a little lighter and uses a standard blur.

3 of 4 behind. Update with: ballmac update  (add --dry-run to preview)`}
      />
      <p>
        Every item has a version and a changelog written for someone who customised the file: what behaviour changed, and whether props were added,
        renamed or removed. Breaking changes are marked. The same notes are on each component page under <strong>What changed</strong>.
      </p>

      <h2>Update, keeping your edits</h2>
      <CodePanel lang="bash" code={"npx @ballmac/cli update --dry-run   # show what would happen, change nothing\nnpx @ballmac/cli update             # do it"} />
      <p>For each file, <code>ballmac</code> compares three versions: the one you installed, yours now, and the new one.</p>
      <ul>
        <li>
          <strong>You never touched it</strong>: replaced with the new version.
        </li>
        <li>
          <strong>You edited it, and Ballmac changed other lines</strong>: merged. Both sets of changes are kept.
        </li>
        <li>
          <strong>You and Ballmac changed the same lines</strong>: the file gets git-style conflict markers, because only you know which one you want.
          Search for <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, choose, and run your tests.
        </li>
        <li>
          <strong>A file you deleted</strong> stays deleted. <strong>New files and new dependencies</strong> a version adds are installed and tracked.
        </li>
      </ul>
      <CodePanel
        lang="bash"
        title="Output"
        code={`button  1.0.0 → 1.1.0
  1.1.0: The lg size is taller and larger so it matches the lg input and select.
  merged   src/components/ballmac/button.tsx  your changes kept
  updated  src/components/ballmac/__tests__/button.test.tsx

dialog  1.0.0 → 1.1.0
  CONFLICT src/components/ballmac/dialog.tsx  1 conflict(s): search for <<<<<<< and choose

2 item(s) updated. 1 file(s) have conflicts to resolve.
Originals are in .ballmac/backup/2026-10-11T10-54-02-743Z/`}
      />
      <p>
        Before anything is written, every file it might change is copied to <code>.ballmac/backup/</code> (ignored by git), and if shadcn fails
        halfway your files are put back. Files that shadcn shares between items, such as your own edits to the i18n helper, are never overwritten.
      </p>

      <h2>See what you changed</h2>
      <CodePanel lang="bash" code={"npx @ballmac/cli diff button"} />
      <p>Shows your changes against the version you installed, nothing else. Useful before an update, and for remembering why a file differs.</p>

      <h2 id="tests">Tests that ship with components</h2>
      <p>
        Most free components come with the test we run on them: keyboard use, states and ARIA, written with vitest and Testing Library. Add them
        with <code>--with-tests</code>, or later with <code>ballmac test add</code>.
      </p>
      <CodePanel lang="bash" code={"npx @ballmac/cli add dialog --with-tests\nnpx @ballmac/cli test add button   # for items you already have\nnpx @ballmac/cli test              # run every Ballmac test in the project"} />
      <p>
        Tests are installed in <code>__tests__</code> next to the components, with one shared <code>setup.ts</code>. The tool installs the packages
        they need at versions known to work together (vitest, jsdom, Testing Library, the React plugin) and, if you have no vitest config yet,
        creates one with your <code>@</code> alias. Pages for components that have a test say so. A test is yours once installed, and it is updated
        with the component: your additions are merged like any other file.
      </p>
      <p>
        With an AI agent, this closes the loop: after it edits a component it can run the test and fix what it broke. Pro blocks are tested in
        batches rather than one by one, so they do not ship per-item tests yet.
      </p>

      <h2>Items you already installed</h2>
      <p>
        Installed with plain <code>shadcn add</code>? Adopt them:
      </p>
      <CodePanel lang="bash" code={"npx @ballmac/cli track            # every Ballmac item found in the project\nnpx @ballmac/cli track dialog button"} />
      <p>
        A file identical to what shadcn writes today is recorded as untouched. One that differs is recorded <strong>without a base</strong>, because
        it may be edited or from an older version and there is no way to tell. For those, an update puts the new version beside your file as{" "}
        <code>&lt;file&gt;.ballmac-new</code> instead of guessing. Once you have compared them, <code>ballmac track --rebase button</code> declares
        your file current.
      </p>

      <h2>Pro, CI and agents</h2>
      <ul>
        <li>
          <strong>Pro items</strong> work the same way. Set <code>BALLMAC_LICENSE_KEY</code> in your environment or <code>.env.local</code> (see{" "}
          <Link href="/docs/pro">Pro</Link>); without it only free items are listed.
        </li>
        <li>
          <strong>CI</strong>: <code>ballmac outdated --exit-code</code> fails when something is behind, and <code>--json</code> prints the same
          data for scripts.
        </li>
        <li>
          <strong>Agents</strong>: the <Link href="/docs/mcp">Ballmac MCP server</Link> has <code>get_changes</code> (what changed since a version, with
          breaking changes flagged) and <code>get_tests</code> (the test for an item).
        </li>
      </ul>

      <h2>Limits</h2>
      <ul>
        <li>
          Merging is line based and needs <code>git</code> on your PATH (it uses <code>git merge-file</code>; no repository is needed). Without
          git, edited files get the <code>.ballmac-new</code> treatment.
        </li>
        <li>A merge that applies cleanly can still be wrong in meaning. Run the tests, and read the changelog note.</li>
        <li>Themes are CSS variables, not files, so they are not merged. Re-apply a theme with the shadcn CLI.</li>
        <li>
          Examples and demos are not tracked, only the items you install. Needs Node.js 20 or later and a project with a <code>components.json</code>.
        </li>
      </ul>
      <p>
        The shadcn CLI is documented in <Link href="/docs/registry">CLI & registry</Link>. Something wrong? <Link href="/support">Tell us</Link>.
      </p>
    </DocsPage>
  )
}
