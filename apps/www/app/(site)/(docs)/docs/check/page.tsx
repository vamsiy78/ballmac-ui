import type { Metadata } from "next"

import Link from "@/components/site/link"

import { CodePanel } from "@/components/site/code-panel"
import { DocsPage } from "@/components/site/docs-page"
import rules from "@/lib/generated/check-rules.json"

export const metadata: Metadata = {
  title: "Quality check",
  description: "ballmac check audits your own app for missing states, accessibility gaps, hard-coded colors and layout problems, and gives AI agents a gate to run before they finish.",
  alternates: { canonical: "/docs/check" },
}

type Rule = { id: string; area: string; title: string; why: string; fix: string; defaultLevel: string; example?: { bad: string; good: string } }
const AREAS: [string, string][] = [
  ["states", "States"],
  ["a11y", "Accessibility"],
  ["tokens", "Tokens"],
  ["motion", "Motion"],
  ["layout", "Layout"],
  ["rtl", "Right to left"],
]
const LEVEL: Record<string, string> = { error: "Error", warn: "Warning", info: "Note", off: "Off by default" }

export default function CheckPage() {
  const all = rules as Rule[]
  return (
    <DocsPage
      title="Quality check"
      lead="Every item here is measured before it ships. ballmac check holds your own app to the same bar: it reads your source, reports what it is sure about, and tells you how to fix it. An AI agent can run it before it says it is done."
    >
      <h2>Run it</h2>
      <CodePanel lang="bash" code={"npx @ballmac/cli check              # audit this project\nnpx @ballmac/cli check src/app      # one folder\nnpx @ballmac/cli check --rules      # list every rule"} />
      <p>
        It is read-only, needs no account and no network (the rule list is bundled; it only looks up which of your components have states if you are
        online), and uses the TypeScript version your project already has. Your own <code>components/ui</code> and Ballmac files are skipped unless
        you pass <code>--include-library</code>.
      </p>
      <CodePanel
        lang="bash"
        title="Output"
        code={`ballmac check  ·  41 files

error a11y/control-name ×1  A button or link has an icon but no accessible name
  src/app/toolbar.tsx:18:7
    <button> contains only an icon and has no accessible name.
      18 │ <button onClick={() => setOpen(!open)} className="p-2">
  fix: Add aria-label="What it does" to the control, or include visually hidden text such as <span className="sr-only">Close</span>.
  https://ui.ballmac.com/docs/check#a11y-control-name`}
      />

      <h2>What it is, and is not</h2>
      <ul>
        <li>
          <strong>Conservative.</strong> A rule reports only when it can see the problem in the code. If a value comes from a variable it cannot
          follow, it stays quiet. A clean result means none of these specific mistakes was found, not that the app is accessible.
        </li>
        <li>
          <strong>Not a replacement for testing.</strong> Automated checks find a subset of problems. Use a keyboard and a screen reader on the real
          app as well.
        </li>
        <li>
          <strong>Honest about severity.</strong> Errors are things that break for someone (an image with no alt, a button with no name). Warnings
          are likely gaps. You decide what fails the build.
        </li>
      </ul>

      <h2>Flags</h2>
      <div className="overflow-x-auto rounded-xl border not-prose">
        <table className="w-full text-sm">
          <tbody className="divide-y">
            {[
              ["--format pretty|json|github", "Human output, machine output, or GitHub Actions annotations."],
              ["--fail-on error|warn|never", "When to exit with code 1. Default: error."],
              ["--rules", "Print the rules with why and how to fix, then exit."],
              ["--all", "Include rules that are off by default (right to left)."],
              ["--offline", "Do not look anything up on the network."],
              ["--include-library", "Also audit components/ui and the Ballmac folder."],
              ["--url <address>", "Also load your running app in a browser (see below)."],
              ["--routes /a,/b", "Which routes to load with --url. Default: /."],
            ].map(([flag, text]) => (
              <tr key={flag}>
                <td className="px-4 py-2.5 align-top font-mono text-[13px] whitespace-nowrap">{flag}</td>
                <td className="text-muted-foreground px-4 py-2.5">{text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="runtime">Check the running app</h2>
      <CodePanel lang="bash" code={"npx @ballmac/cli check --url http://localhost:3000 --routes /,/pricing"} />
      <p>
        Reading source cannot see what the browser renders. With <code>--url</code> the tool opens each route with the Playwright and axe-core that
        are already in your project (it never installs anything), in light and dark at 390 and 1280 pixels wide, and reports serious or critical axe
        violations, sideways scrolling on a phone, and console errors. If Playwright is not installed it says so and still runs the source checks.
      </p>

      <h2>Settings</h2>
      <CodePanel
        lang="json"
        title=".ballmacrc.json (or a “ballmac” key in package.json)"
        code={`{
  "rules": { "layout/fixed-wide": "warn", "tokens/hardcoded-color": "off", "rtl/physical-direction": "warn" },
  "ignore": ["src/legacy/**", "**/*.stories.tsx"],
  "rtl": true
}`}
      />
      <p>Silence one finding where it is, with a reason a teammate can read:</p>
      <CodePanel
        lang="tsx"
        code={`{/* ballmac-ignore-next-line a11y/control-name: the label is added by the wrapper */}
<IconButton onClick={close} />

// ballmac-ignore-line
// ballmac-ignore-file`}
      />

      <h2>In CI and in an agent</h2>
      <CodePanel
        lang="bash"
        title=".github/workflows/quality.yml"
        code={`- run: npx @ballmac/cli check --format github --fail-on error`}
      />
      <p>
        The <Link href="/docs/mcp">Ballmac MCP server</Link> has <code>get_quality_rules</code>, so an agent can read the rules before it writes a
        component, and <code>audit_project</code>, which runs this check and returns the findings worst first, each with its fix. Tell your agent:
        “before you finish, run <code>audit_project</code> and fix every error.”
      </p>

      <h2>Rules</h2>
      <p>
        {all.length} rules. Each one says why it matters to the person using your app and how to fix it.
      </p>
      {AREAS.map(([area, label]) => {
        const list = all.filter((r) => r.area === area)
        if (!list.length) return null
        return (
          <section key={area} className="space-y-4">
            <h3>{label}</h3>
            {list.map((r) => (
              <div key={r.id} id={r.id.replace("/", "-")} className="bg-card scroll-mt-24 space-y-3 rounded-xl border p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <code className="!bg-transparent !p-0 font-mono text-[13px] font-semibold">{r.id}</code>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">{LEVEL[r.defaultLevel]}</span>
                </div>
                <p className="!text-foreground text-[15px] font-medium">{r.title}</p>
                <p>{r.why}</p>
                <p>
                  <strong>Fix:</strong> {r.fix}
                </p>
                {r.example && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium">Instead of</p>
                      <CodePanel lang="tsx" code={r.example.bad} />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium">Write</p>
                      <CodePanel lang="tsx" code={r.example.good} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )
      })}

      <h2>Limits</h2>
      <ul>
        <li>It reads TypeScript and JSX. Other file types and styles written in separate stylesheets are only partly covered (motion in CSS is).</li>
        <li>Components from other libraries are treated as able to render what they need. Only plain elements and Ballmac components are judged.</li>
        <li>
          Contrast is measured only by <code>--url</code> (axe), because it depends on the final rendered colors.
        </li>
      </ul>
      <p>
        See how the library itself scores on the <Link href="/quality">quality page</Link>. Found a false positive? <Link href="/support">Tell us</Link>{" "}
        and include the line.
      </p>
    </DocsPage>
  )
}
