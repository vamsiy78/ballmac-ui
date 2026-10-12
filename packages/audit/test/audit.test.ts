import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

import { describe, expect, it } from "vitest"

import { audit, docsUrl, formatGithub, formatPretty, loadTypescript, RULES, summaryLine, type AuditOptions, type Report } from "../src/index.js"

/** Writes a small project to a temp folder and audits it. */
function run(files: Record<string, string>, extra: Partial<AuditOptions> = {}): Report {
  const root = mkdtempSync(join(tmpdir(), "ballmac-audit-"))
  for (const [path, content] of Object.entries(files)) {
    const abs = join(root, path)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, content)
  }
  return audit({ root, ...extra })
}
const tsx = (body: string, head = "") => ({ "src/page.tsx": `${head}\nexport function Page() {\n  return (\n    <>\n${body}\n    </>\n  )\n}\n` })
const rules = (r: Report) => r.findings.map((f) => f.rule)
const only = (r: Report, rule: string) => r.findings.filter((f) => f.rule === rule)
const shadcn = { "components.json": JSON.stringify({ tailwind: { cssVariables: true } }) }

describe("setup", () => {
  it("finds TypeScript", () => {
    expect(loadTypescript(process.cwd())).toBeDefined()
  })
  it("describes every rule with a fix and a reason", () => {
    for (const r of RULES) {
      expect(r.title.length).toBeGreaterThan(10)
      expect(r.why.length).toBeGreaterThan(30)
      expect(r.fix.length).toBeGreaterThan(20)
    }
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length)
  })
})

describe("a11y/img-alt", () => {
  it("flags an image with no alt", () => {
    const r = run(tsx(`<img src="/a.png" />`))
    expect(only(r, "a11y/img-alt")).toHaveLength(1)
    expect(only(r, "a11y/img-alt")[0]).toMatchObject({ file: "src/page.tsx", severity: "error" })
  })
  it("accepts alt, an empty alt and a spread", () => {
    expect(rules(run(tsx(`<img src="/a.png" alt="A chart" />\n<img src="/b.png" alt="" />\n<img {...props} />`)))).not.toContain("a11y/img-alt")
  })
  it("checks next/image but not another Image", () => {
    expect(rules(run(tsx(`<Image src="/a.png" width={1} height={1} />`, `import Image from "next/image"`)))).toContain("a11y/img-alt")
    expect(rules(run(tsx(`<Image src="/a.png" />`, `import { Image } from "./mine"`)))).not.toContain("a11y/img-alt")
  })
})

describe("a11y/control-name", () => {
  const head = `import { X, Menu } from "lucide-react"\nimport { CloseIcon } from "./icons"`
  it("flags an icon-only button and link", () => {
    expect(only(run(tsx(`<button onClick={f}><X /></button>`, head)), "a11y/control-name")).toHaveLength(1)
    expect(only(run(tsx(`<button><CloseIcon /></button>`, head)), "a11y/control-name")).toHaveLength(1)
    expect(only(run(tsx(`<a href="/menu"><svg viewBox="0 0 1 1" /></a>`)), "a11y/control-name")).toHaveLength(1)
    expect(only(run(tsx(`<Button size="icon"><Menu /></Button>`, head)), "a11y/control-name")).toHaveLength(1)
  })
  it("sees through a conditional or && icon, which is still icon-only", () => {
    expect(only(run(tsx(`<button onClick={f}>{open ? <X /> : <Menu />}</button>`, head)), "a11y/control-name")).toHaveLength(1)
    expect(only(run(tsx(`<button onClick={f}>{busy && <X />}</button>`, head)), "a11y/control-name")).toHaveLength(1)
    // …but not when one branch can be text.
    expect(rules(run(tsx(`<button onClick={f}>{open ? <X /> : "Open"}</button>`, head)))).not.toContain("a11y/control-name")
    expect(rules(run(tsx(`<button onClick={f}>{open ? <X /> : label}</button>`, head)))).not.toContain("a11y/control-name")
  })
  it("flags an empty button", () => {
    expect(only(run(tsx(`<button></button>`)), "a11y/control-name")).toHaveLength(1)
  })
  it("accepts visible text, aria-label, hidden text and anything it cannot see into", () => {
    const body = [
      `<button><X /> Close</button>`,
      `<button aria-label="Close"><X /></button>`,
      `<button><span className="sr-only">Close</span><X /></button>`,
      `<button>{label}</button>`,
      `<Link href="/"><Logo /></Link>`,
      `<button title="Menu"><Menu /></button>`,
      `<button {...props} />`,
      `<a href="/"><svg><title>Home</title></svg></a>`,
    ].join("\n")
    expect(rules(run(tsx(body, head)))).not.toContain("a11y/control-name")
  })
})

describe("a11y/clickable-non-interactive", () => {
  it("flags a div with onClick and no role or tabIndex", () => {
    expect(only(run(tsx(`<div onClick={open}>Open</div>`)), "a11y/clickable-non-interactive")).toHaveLength(1)
    expect(only(run(tsx(`<img src="a" alt="" onClick={open} />`)), "a11y/clickable-non-interactive")).toHaveLength(1)
  })
  it("flags a role with no keyboard handler", () => {
    const r = run(tsx(`<div role="button" tabIndex={0} onClick={open}>Open</div>`))
    expect(only(r, "a11y/clickable-non-interactive")[0]?.message).toMatch(/keyboard handler/)
  })
  it("accepts a complete custom control, a button and a propagation stopper", () => {
    const body = `<div role="button" tabIndex={0} onClick={open} onKeyDown={key}>Open</div>\n<button onClick={open}>Open</button>\n<div onClick={(e) => e.stopPropagation()}>x</div>\n<div onClick={f} role="presentation" />`
    expect(rules(run(tsx(body)))).not.toContain("a11y/clickable-non-interactive")
  })
})

describe("a11y/focus-outline-removed", () => {
  it("flags outline-none with nothing in its place", () => {
    expect(only(run(tsx(`<button className="outline-none px-2">Go</button>`)), "a11y/focus-outline-removed")).toHaveLength(1)
    expect(only(run(tsx(`<input className={cn("focus:outline-none", x)} />`)), "a11y/focus-outline-removed")).toHaveLength(1)
  })
  it("accepts a replacement", () => {
    const body = `<button className="outline-none focus-visible:ring-2 focus-visible:ring-ring">Go</button>\n<a href="/" className="focus:outline-none focus:bg-accent">Go</a>\n<div className="outline-none">not focusable</div>`
    expect(rules(run(tsx(body)))).not.toContain("a11y/focus-outline-removed")
  })
})

describe("a11y/input-label", () => {
  it("flags a field with only a placeholder", () => {
    expect(only(run(tsx(`<input placeholder="Email" />`)), "a11y/input-label")).toHaveLength(1)
    expect(only(run(tsx(`<textarea />`)), "a11y/input-label")).toHaveLength(1)
  })
  it("accepts aria-label, a wrapping label, a matching htmlFor and hidden inputs", () => {
    const body = `<input aria-label="Email" />\n<label>Name <input /></label>\n<label htmlFor="e">Email</label>\n<input id="e" />\n<input type="hidden" name="x" />\n<input {...register("a")} />`
    expect(rules(run(tsx(body)))).not.toContain("a11y/input-label")
  })
  it("treats Field, Label and FormControl as labelling", () => {
    expect(rules(run(tsx(`<Field><FieldLabel>Name</FieldLabel><input /></Field>`)))).not.toContain("a11y/input-label")
  })
})

describe("a11y/positive-tabindex", () => {
  it("flags tabIndex above zero only", () => {
    expect(only(run(tsx(`<div tabIndex={3} />`)), "a11y/positive-tabindex")).toHaveLength(1)
    expect(rules(run(tsx(`<div tabIndex={0} /><div tabIndex={-1} />`)))).not.toContain("a11y/positive-tabindex")
  })
})

describe("a11y/hand-rolled-dialog", () => {
  it("flags a full-screen overlay built by hand", () => {
    expect(only(run(tsx(`<div className="fixed inset-0 z-50 bg-black/50">x</div>`)), "a11y/hand-rolled-dialog")).toHaveLength(1)
  })
  it("leaves real dialogs, decorative backgrounds and semantic overlays alone", () => {
    expect(rules(run(tsx(`<div className="fixed inset-0 z-50 bg-black/50" />`, `import { Dialog } from "@/components/ui/dialog"`)))).not.toContain("a11y/hand-rolled-dialog")
    expect(rules(run(tsx(`<div className="fixed inset-0 -z-10 pointer-events-none" />`)))).not.toContain("a11y/hand-rolled-dialog")
    expect(rules(run(tsx(`<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/50" />`)))).not.toContain("a11y/hand-rolled-dialog")
  })
})

describe("a11y/link-no-href", () => {
  it("flags an anchor without href", () => {
    expect(only(run(tsx(`<a onClick={go}>Go</a>`)), "a11y/link-no-href")).toHaveLength(1)
    expect(rules(run(tsx(`<a href="/x">Go</a>`)))).not.toContain("a11y/link-no-href")
  })
})

describe("tokens/hardcoded-color", () => {
  it("warns about neutral palette colours in an app that uses theme tokens", () => {
    const r = run({ ...shadcn, ...tsx(`<div className="bg-white text-gray-900 border-gray-200">x</div>`) })
    const f = only(r, "tokens/hardcoded-color")
    expect(f).toHaveLength(1)
    expect(f[0]?.severity).toBe("warn")
    expect(f[0]?.message).toContain("bg-white")
  })
  it("lowers it to a note when the element sets dark: itself, or the app has no tokens", () => {
    expect(only(run({ ...shadcn, ...tsx(`<div className="bg-white dark:bg-zinc-900">x</div>`) }), "tokens/hardcoded-color")[0]?.severity).toBe("info")
    expect(only(run(tsx(`<div className="bg-white">x</div>`)), "tokens/hardcoded-color")[0]?.severity).toBe("info")
  })
  it("treats status colours as notes and finds hex values and inline styles", () => {
    expect(only(run({ ...shadcn, ...tsx(`<p className="text-red-500">Failed</p>`) }), "tokens/hardcoded-color")[0]?.severity).toBe("info")
    expect(only(run({ ...shadcn, ...tsx(`<div className="bg-[#0ea5e9]" />`) }), "tokens/hardcoded-color")[0]?.severity).toBe("warn")
    expect(only(run({ ...shadcn, ...tsx(`<div style={{ color: "#333" }} />`) }), "tokens/hardcoded-color")).toHaveLength(1)
  })
  it("accepts theme tokens", () => {
    expect(rules(run({ ...shadcn, ...tsx(`<div className="bg-background text-foreground border-border text-muted-foreground bg-primary">x</div>`) }))).not.toContain("tokens/hardcoded-color")
  })
  it("can be turned off, or up", () => {
    expect(rules(run({ ...shadcn, ...tsx(`<div className="bg-white" />`) }, { config: { rules: { "tokens/hardcoded-color": "off" } } }))).not.toContain("tokens/hardcoded-color")
    expect(only(run({ ...shadcn, ...tsx(`<div className="bg-white dark:bg-zinc-900" />`) }, { config: { rules: { "tokens/hardcoded-color": "error" } } }), "tokens/hardcoded-color")[0]?.severity).toBe("error")
  })
})

describe("motion/endless-decorative", () => {
  it("flags decorative loops without a reduced-motion guard", () => {
    expect(only(run(tsx(`<span className="animate-ping" />`)), "motion/endless-decorative")).toHaveLength(1)
    expect(only(run(tsx(`<div className="animate-bounce" />`)), "motion/endless-decorative")).toHaveLength(1)
    expect(only(run(tsx(`<div className="x" />`, `const t = { repeat: Infinity }`)), "motion/endless-decorative")).toHaveLength(1)
  })
  it("accepts guarded loops, spinners and Motion loops that listen", () => {
    expect(rules(run(tsx(`<span className="animate-ping motion-reduce:animate-none" />\n<span className="motion-safe:animate-pulse" />\n<Spinner className="animate-spin" />`)))).not.toContain("motion/endless-decorative")
    expect(rules(run(tsx(`<div />`, `import { useReducedMotion } from "motion/react"\nconst t = { repeat: Infinity }\nuseReducedMotion()`)))).not.toContain("motion/endless-decorative")
  })
  it("checks style sheets", () => {
    expect(only(run({ "src/app.css": ".dot { animation: pulse 2s infinite; }" }), "motion/endless-decorative")).toHaveLength(1)
    expect(rules(run({ "src/app.css": "@media (prefers-reduced-motion: no-preference) { .dot { animation: pulse 2s infinite; } }" }))).not.toContain("motion/endless-decorative")
    expect(rules(run({ "src/app.css": ".spinner { animation: spin 1s linear infinite; }" }))).not.toContain("motion/endless-decorative")
  })
})

describe("layout", () => {
  it("flags a fixed width wider than a phone", () => {
    expect(only(run(tsx(`<div className="w-[480px]" />`)), "layout/fixed-wide")).toHaveLength(1)
    expect(only(run(tsx(`<div style={{ width: 600 }} />`)), "layout/fixed-wide")).toHaveLength(1)
  })
  it("accepts a capped or responsive width and small fixed widths", () => {
    expect(rules(run(tsx(`<div className="w-[480px] max-w-full" />\n<div className="md:w-[480px]" />\n<div className="w-[320px]" />\n<div style={{ width: 200 }} />`)))).not.toContain("layout/fixed-wide")
  })
  it("notes h-screen", () => {
    expect(only(run(tsx(`<main className="h-screen" />`)), "layout/viewport-height")[0]?.severity).toBe("info")
  })
})

describe("rtl/physical-direction", () => {
  it("is off unless enabled", () => {
    expect(rules(run(tsx(`<div className="ml-4 text-left" />`)))).not.toContain("rtl/physical-direction")
  })
  it("suggests logical classes when enabled", () => {
    const r = run(tsx(`<div className="ml-4 pr-2 text-left left-0 border-l rounded-tl-md md:mr-3" />`), { config: { rtl: true } })
    const f = only(r, "rtl/physical-direction")
    expect(f).toHaveLength(1)
    expect(f[0]?.message).toContain("ml-4 → ms-4")
    expect(f[0]?.severity).toBe("info")
  })
  it("leaves centring alone", () => {
    expect(rules(run(tsx(`<div className="left-1/2 -translate-x-1/2" />`), { config: { rtl: true } }))).not.toContain("rtl/physical-direction")
  })
})

describe("states/data-without-states", () => {
  const hook = `import { useQuery } from "@tanstack/react-query"`
  it("flags a data hook with no loading or error handling", () => {
    const r = run({ "src/list.tsx": `${hook}\nexport function List() {\n  const { data } = useQuery({ queryKey: ["a"] })\n  return <ul>{data?.map((d) => <li key={d.id}>{d.name}</li>)}</ul>\n}\n` })
    expect(only(r, "states/data-without-states")).toHaveLength(1)
  })
  it("accepts loading and error handling, or a Suspense boundary", () => {
    expect(rules(run({ "src/list.tsx": `${hook}\nexport function List() {\n  const { data, isPending } = useQuery({})\n  if (isPending) return <p>Loading</p>\n  return <ul />\n}\n` }))).not.toContain("states/data-without-states")
    expect(rules(run({ "src/list.tsx": `${hook}\nexport function List() {\n  const { data } = useQuery({})\n  return <Suspense fallback={null}><ul /></Suspense>\n}\n` }))).not.toContain("states/data-without-states")
  })
  it("ignores a hook that does not come from a data library", () => {
    expect(rules(run({ "src/a.tsx": `import { useQuery } from "./mine"\nexport const A = () => { const x = useQuery(); return <p>{x}</p> }\n` }))).not.toContain("states/data-without-states")
  })
})

describe("states/ballmac-state-prop", () => {
  const catalog = { "dashboard-pro-1": { exports: ["DashboardPro1"], states: ["loading", "empty", "error"] }, button: { exports: ["Button"] } }
  const head = `import { DashboardPro1 } from "@/components/ballmac/blocks/dashboard-pro-1/dashboard-pro-1"\nimport { Button } from "@/components/ballmac/button"`
  it("flags a component that declares states and is used without a state prop", () => {
    const r = run(tsx(`<DashboardPro1 />`, head), { catalog })
    const f = only(r, "states/ballmac-state-prop")
    expect(f).toHaveLength(1)
    expect(f[0]?.message).toContain("loading, empty, error")
  })
  it("accepts a state prop or a spread, and components without states", () => {
    expect(rules(run(tsx(`<DashboardPro1 state="loading" />\n<DashboardPro1 {...props} />\n<Button>Go</Button>`, head), { catalog }))).not.toContain("states/ballmac-state-prop")
  })
  it("applies to the main export only, not helpers exported beside it", () => {
    const withHelper = { "ai-chat-2": { exports: ["AiChat2", "PricingPreview"], states: ["loading"] } }
    const head2 = `import { AiChat2, PricingPreview } from "@/components/ballmac/blocks/ai-chat-2/ai-chat-2"`
    const r = run(tsx(`<AiChat2 />\n<PricingPreview />`, head2), { catalog: withHelper })
    expect(only(r, "states/ballmac-state-prop")).toHaveLength(1)
  })
  it("ignores a component with the same name from somewhere else", () => {
    expect(rules(run(tsx(`<DashboardPro1 />`, `import { DashboardPro1 } from "./mine"`), { catalog }))).not.toContain("states/ballmac-state-prop")
  })
  it("says so when it had no catalogue to read", () => {
    expect(run(tsx(`<div />`)).notes.join(" ")).toMatch(/catalogue/)
  })
})

describe("suppression", () => {
  const bad = `<img src="/a.png" />`
  it("ignores the next line, with or without a rule name", () => {
    expect(rules(run(tsx(`      {/* ballmac-ignore-next-line */}\n${bad}`)))).not.toContain("a11y/img-alt")
    expect(rules(run(tsx(`      {/* ballmac-ignore-next-line a11y/img-alt */}\n${bad}`)))).not.toContain("a11y/img-alt")
  })
  it("keeps a rule that was not named", () => {
    expect(rules(run(tsx(`      {/* ballmac-ignore-next-line tokens/hardcoded-color */}\n${bad}`)))).toContain("a11y/img-alt")
  })
  it("ignores a whole file", () => {
    expect(rules(run({ "src/page.tsx": `// ballmac-ignore-file\nexport const P = () => ${bad}\n` }))).not.toContain("a11y/img-alt")
  })
})

describe("settings and discovery", () => {
  it("reads .ballmacrc.json and package.json, and names mistakes", () => {
    const r = run({ ...tsx(`<img src="/a.png" />`), ".ballmacrc.json": JSON.stringify({ rules: { "a11y/img-alt": "off", "nope/rule": "warn", "a11y/positive-tabindex": "loud" } }) })
    expect(rules(r)).not.toContain("a11y/img-alt")
    expect(r.notes.join(" ")).toMatch(/Unknown rule "nope\/rule"/)
    expect(r.notes.join(" ")).toMatch(/level "loud"/)
    const p = run({ ...tsx(`<img src="/a.png" />`), "package.json": JSON.stringify({ name: "x", ballmac: { rules: { "a11y/img-alt": "warn" } } }) })
    expect(only(p, "a11y/img-alt")[0]?.severity).toBe("warn")
  })
  it("skips dependencies, build output, tests and installed library code", () => {
    const bad = `export const P = () => <img src="/a.png" />\n`
    const r = run({ "node_modules/x/a.tsx": bad, ".next/b.tsx": bad, "src/a.test.tsx": bad, "e2e/c.tsx": bad, "components/ui/button.tsx": bad, "components/ballmac/dialog.tsx": bad, "src/ok.tsx": bad })
    expect(r.findings.map((f) => f.file)).toEqual(["src/ok.tsx"])
    const all = run({ "components/ui/button.tsx": bad }, { includeLibrary: true })
    expect(all.findings).toHaveLength(1)
  })
  it("honours ignore patterns and path arguments", () => {
    const bad = `export const P = () => <img src="/a.png" />\n`
    expect(run({ "src/legacy/a.tsx": bad, "src/b.tsx": bad }, { config: { ignore: ["src/legacy"] } }).findings.map((f) => f.file)).toEqual(["src/b.tsx"])
    expect(run({ "src/a.tsx": bad, "src/b.tsx": bad }, { paths: ["src/b.tsx"] }).findings.map((f) => f.file)).toEqual(["src/b.tsx"])
  })
  it("audits a folder even when it is named like a build folder", () => {
    const root = mkdtempSync(join(tmpdir(), "x-"))
    const dir = join(root, "build")
    mkdirSync(dir)
    writeFileSync(join(dir, "a.tsx"), `export const P = () => <img src="/a.png" />\n`)
    expect(audit({ root: dir }).findings).toHaveLength(1)
  })
})

describe("report and formatting", () => {
  const r = run({ ...shadcn, ...tsx(`<img src="/a.png" />\n<div onClick={f}>x</div>\n<div className="bg-white" />`) })
  it("counts by severity and rule and sorts by position", () => {
    expect(r.counts.error).toBe(2)
    expect(r.byRule["a11y/img-alt"]).toBe(1)
    expect(r.findings.map((f) => f.line)).toEqual([...r.findings.map((f) => f.line)].sort((a, b) => a - b))
    expect(r.filesParsed).toBe(1)
  })
  it("prints a readable report with the fix once per rule", () => {
    const text = formatPretty(r)
    expect(text).toContain("a11y/img-alt")
    expect(text).toContain("fix: Add alt")
    expect(text).toContain("src/page.tsx:")
    expect(text).toContain(docsUrl("a11y/img-alt"))
    expect(text).toMatch(/✗ 2 errors, 1 warning, 0 notes in 1 file/)
  })
  it("writes GitHub annotations", () => {
    const g = formatGithub(r).split("\n")
    expect(g[0]).toMatch(/^::error file=src\/page\.tsx,line=\d+,col=\d+,title=a11y\/img-alt::/)
    expect(g.some((l) => l.startsWith("::warning "))).toBe(true)
  })
  it("marks a lowered finding inside a stronger group", () => {
    const mixed = run({ ...shadcn, ...tsx(`<div className="bg-white" />\n<p className="text-red-500">x</p>`) })
    expect(formatPretty(mixed)).toMatch(/\(note\)/)
  })
  it("says clearly when everything is fine", () => {
    const clean = run(tsx(`<img src="/a.png" alt="A chart" />`))
    expect(summaryLine(clean)).toBe("No findings.")
    expect(formatPretty(clean)).toContain("✓ No findings.")
  })
})

describe("false positives found on real code stay fixed", () => {
  it("does not flag a heading that takes focus from code (tabIndex -1) or a field inside a focus-within wrapper", () => {
    const body = `<h2 tabIndex={-1} className="outline-none">Sent</h2>\n<div className="rounded-md border focus-within:ring-2"><input aria-label="Name" className="outline-none" /></div>\n<div className="has-[:focus-visible]:ring-2"><textarea aria-label="Note" className="outline-none" /></div>`
    expect(rules(run(tsx(body)))).not.toContain("a11y/focus-outline-removed")
  })
  it("still flags a tab-reachable element that removes its outline", () => {
    expect(rules(run(tsx(`<div tabIndex={0} className="outline-none">x</div>`)))).toContain("a11y/focus-outline-removed")
  })
  it("does not ask for a label on something hidden from assistive technology", () => {
    expect(rules(run(tsx(`<div aria-hidden="true"><input type="text" name="website" tabIndex={-1} /><button><svg /></button></div>`)))).not.toContain("a11y/input-label")
    expect(rules(run(tsx(`<div aria-hidden="true"><button><svg /></button></div>`)))).not.toContain("a11y/control-name")
  })
  it("does not flag a wide element in a scrolling or clipping container", () => {
    expect(rules(run(tsx(`<div className="overflow-x-auto"><table className="min-w-[560px]" /></div>\n<div className="overflow-hidden"><div className="w-[900px]" /></div>`)))).not.toContain("layout/fixed-wide")
  })
  it("treats animate-pulse as a note and animate-ping as a warning", () => {
    expect(only(run(tsx(`<div className="animate-pulse" />`)), "motion/endless-decorative")[0]?.severity).toBe("info")
    expect(only(run(tsx(`<div className="animate-ping" />`)), "motion/endless-decorative")[0]?.severity).toBe("warn")
  })
  it("accepts a CSS loop whose play state the theme controls", () => {
    const css = `.pulse {\n  animation: pulse 2s ease-in-out infinite;\n  animation-play-state: var(--bm-ambient-state, running);\n}`
    expect(rules(run({ "src/app.css": css }))).not.toContain("motion/endless-decorative")
  })
})
