import { ArrowRight, Github, GitPullRequest, Keyboard, Languages, Layers, ListChecks, Palette, Play, ShieldCheck, TestTube2, Type } from "lucide-react"
import type { Metadata } from "next"

import { buttonVariants } from "@/components/ballmac/button"
import { CodePanel } from "@/components/site/code-panel"
import Link from "@/components/site/link"
import { Eyebrow } from "@/components/site/section-heading"
import { BUILT_WITH, ISSUE_URL, PROPOSE_URL } from "@/lib/built-with"

export const metadata: Metadata = {
  title: "Contribute to Ballmac UI",
  description: "Build a component or block for the free library. The path from idea to merged pull request, the standard every item meets, and what to expect.",
  alternates: { canonical: "/contribute" },
}

const REPO = "https://github.com/vamsiy78/ballmac-ui"

const STEPS = [
  { title: "Propose it", text: "Open the short proposal form: the name, who needs it, and what the best existing version does that yours does better. We answer before you write much code.", href: PROPOSE_URL, cta: "Open the form" },
  { title: "Build it to the standard", text: "Every item has every state, full keyboard support, reduced motion, tokens only and a demo worth installing. The list is below, and AUTHORING.md has the detail.", href: `${REPO}/blob/main/AUTHORING.md`, cta: "Read AUTHORING.md" },
  { title: "Run the checks", text: "One command line runs the registry build, licence and dependency checks, tests, lint and types. A pull request that passes them is easy to review.", href: `${REPO}/blob/main/CONTRIBUTING.md`, cta: "See CONTRIBUTING.md" },
  { title: "Open a pull request", text: "Target the preprod branch, add screenshots in light and dark, and keep to one item. We review, you answer, we merge, and your item is in the next release with a changelog line.", href: `${REPO}/compare/preprod`, cta: "Start a pull request" },
] as const

const STANDARD = [
  { icon: Layers, title: "Every state", text: "Default, hover, focus, active, disabled, loading or empty, invalid, in light and dark." },
  { icon: Keyboard, title: "Keyboard and ARIA", text: "Radix for anything with focus management. Every control reachable, with a visible focus ring." },
  { icon: Play, title: "Reduced motion", text: "Motion only through the shared presets, and it stops for people who ask for less." },
  { icon: Palette, title: "Tokens only", text: "Theme variables, never hex values, so it follows any theme and any platform feel." },
  { icon: Type, title: "Typed and documented", text: "A props type with a comment on every prop. The site's API table is written from it." },
  { icon: Languages, title: "Right to left, translated", text: "Logical properties, mirrored arrows, and every built-in string through the message helper." },
  { icon: TestTube2, title: "Tested", text: "A test for anything interactive: keyboard, controlled and uncontrolled use." },
  { icon: ShieldCheck, title: "Clean licence", text: "Your own code, or MIT, ISC, BSD or Apache-2.0 code with a credit line. Never paid or unlicensed sources." },
] as const

const WANTED = [
  { name: "Vertical app blocks", text: "Screens for one trade: a clinic schedule, a restaurant order board, a matter list for a law firm, a property listing with a map." },
  { name: "Ops and admin", text: "Audit log, access review, on-call rota, queue depth and retry screens, with the loading, empty and error states done." },
  { name: "Data entry", text: "Forms people fill in all day: a bill of materials, a timesheet grid, a bulk editor with undo." },
  { name: "Fixes and polish", text: "A bug you hit, an accessibility gap, a clearer demo, a better translation of a message. Small pull requests are welcome without a proposal." },
] as const

export default function ContributePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-6">
      <header className="relative isolate overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_65%_80%_at_50%_30%,black,transparent)]" />
        <div className="flex justify-center">
          <Eyebrow>Contribute</Eyebrow>
        </div>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Build the next item with us</h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-pretty">
          The free library is open source. Bring a component, a block or a fix. If it meets the standard it ships, with your name in the changelog.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={PROPOSE_URL} className={buttonVariants({ shape: "pill", size: "lg" })}>
            <GitPullRequest aria-hidden="true" /> Propose an item
          </a>
          <a href={REPO} className={buttonVariants({ shape: "pill", size: "lg", variant: "outline" })}>
            <Github aria-hidden="true" /> View on GitHub
          </a>
        </div>
      </header>

      <section aria-labelledby="path-h" className="mt-24">
        <div className="max-w-2xl">
          <Eyebrow>The path</Eyebrow>
          <h2 id="path-h" className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance">From idea to merged in four steps</h2>
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-card relative flex flex-col rounded-2xl border p-6 sm:p-7">
              <span className="text-muted-foreground absolute top-6 right-6 font-mono text-xs tabular-nums rtl:right-auto rtl:left-6" aria-hidden="true">0{i + 1}</span>
              <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed text-pretty">{s.text}</p>
              <a href={s.href} className="text-foreground mt-5 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
                {s.cta} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <CodePanel
            lang="bash"
            title="Before you open the pull request"
            code={`pnpm install
pnpm build:registry
pnpm check && pnpm lint && pnpm typecheck && pnpm test
pnpm a11y <name>      # for the items you touched`}
          />
        </div>
      </section>

      <section aria-labelledby="std-h" className="mt-24">
        <div className="max-w-2xl">
          <Eyebrow>The standard</Eyebrow>
          <h2 id="std-h" className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance">What every item has</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed text-pretty">This is what keeps one library feeling like one library. It is also how we compare with every other library: the best existing version, then better.</p>
        </div>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STANDARD.map(({ icon: Icon, title, text }) => (
            <li key={title} className="bg-background p-6">
              <Icon className="size-5" aria-hidden="true" />
              <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="wanted-h" className="mt-24">
        <div className="max-w-2xl">
          <Eyebrow>Where help is wanted</Eyebrow>
          <h2 id="wanted-h" className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance">Good places to start</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed text-pretty">We are not chasing a bigger count. We want items nobody else has, done properly.</p>
        </div>
        <dl className="mt-10 grid gap-4 sm:grid-cols-2">
          {WANTED.map((w) => (
            <div key={w.name} className="bg-card rounded-2xl border p-6">
              <dt className="flex items-center gap-2 font-semibold tracking-tight">
                <ListChecks className="text-muted-foreground size-4" aria-hidden="true" /> {w.name}
              </dt>
              <dd className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">{w.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="terms-h" className="mt-24 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Eyebrow>Licence and credit</Eyebrow>
          <h2 id="terms-h" className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance">What happens to your code</h2>
        </div>
        <ul className="text-muted-foreground space-y-3 text-[15px] leading-relaxed">
          <li>A merged contribution is licensed under the repository&apos;s MIT licence, as in CONTRIBUTING.md. You keep your copyright.</li>
          <li>The free library only. Ballmac UI Pro is written by Ballmac and does not take outside code.</li>
          <li>Code from another project needs a permissive licence (MIT, ISC, BSD or Apache-2.0), a &ldquo;Based on&rdquo; line and its source in the item&apos;s metadata. We check this in CI.</li>
          <li>You are named in the changelog entry for your item.</li>
        </ul>
      </section>

      <section aria-labelledby="show-h" className="bg-foreground text-background mt-24 rounded-3xl px-6 py-14 text-center sm:px-12">
        <h2 id="show-h" className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">Already built something with Ballmac UI?</h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed opacity-75">Show it in the gallery, with the items it uses. It takes one short form.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={ISSUE_URL} className={buttonVariants({ shape: "pill", size: "lg", variant: "secondary" })}>Add your project</a>
          {BUILT_WITH.length > 0 && (
            <Link href="/built-with" className="rounded-full px-5 py-2.5 text-sm font-medium underline underline-offset-4 opacity-80 hover:opacity-100">
              See the gallery
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
