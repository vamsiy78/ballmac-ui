import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { inlineHtml } from "../lib/changelog-inline"
import { atomXml, rssXml } from "../lib/changelog-feed"
import { changelogMarkdown, CHANGELOG_TAGS, getChangelog, parseEntry } from "../lib/changelog"

const root = join(__dirname, "../../..")
const entry = (extra = "") => `---\ntitle: "T"\ndate: 2026-10-18\ntags: [blocks]\nsummary: "One sentence."\n${extra}---\n\n### New\n\n- A line.\n`

describe("changelog entries", () => {
  const entries = getChangelog()

  it("reads every file in content/changelog and lists them newest first", () => {
    const files = readdirSync(join(__dirname, "../content/changelog")).filter((f) => f.endsWith(".md"))
    expect(entries).toHaveLength(files.length)
    expect(entries.length).toBeGreaterThanOrEqual(30)
    for (let i = 1; i < entries.length; i++) expect(entries[i - 1]!.date >= entries[i]!.date).toBe(true)
  })

  it("gives every entry a unique permalink, a real date, known tags and a one-sentence summary", () => {
    expect(new Set(entries.map((e) => e.slug)).size).toBe(entries.length)
    for (const e of entries) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.slug.startsWith(e.date)).toBe(true)
      expect(e.tags.length).toBeGreaterThan(0)
      for (const t of e.tags) expect(CHANGELOG_TAGS).toContain(t)
      expect(e.summary.endsWith(".")).toBe(true)
    }
  })

  it("keeps each group to six plain lines, in Keep a Changelog order", () => {
    for (const e of entries) {
      const groups = Object.keys(e.groups)
      expect(groups.length).toBeGreaterThan(0)
      const order = ["new", "improved", "fixed", "deprecated", "removed", "security"]
      expect(groups).toEqual([...groups].sort((a, b) => order.indexOf(a) - order.indexOf(b)))
      for (const list of Object.values(e.groups)) {
        expect(list!.length).toBeGreaterThan(0)
        expect(list!.length).toBeLessThanOrEqual(6)
        for (const line of list!) expect(line).not.toContain("\n")
      }
    }
  })

  it("has a picture, or a page to screenshot, with alt text for the larger entries", () => {
    for (const e of entries) if (e.image) expect(e.image.alt.length).toBeGreaterThan(10)
  })

  it("finds the pictures the entries name in public/", () => {
    for (const e of entries) {
      if (!e.image) continue
      expect(() => readFileSync(join(__dirname, "../public", e.image!.light)), `${e.slug}: ${e.image!.light}`).not.toThrow()
      if (e.image.dark) expect(() => readFileSync(join(__dirname, "../public", e.image!.dark!)), `${e.slug}: ${e.image!.dark}`).not.toThrow()
    }
  })

  it("matches CHANGELOG.md in the repository (run `pnpm changelog` after editing)", () => {
    expect(readFileSync(join(root, "CHANGELOG.md"), "utf8")).toBe(changelogMarkdown())
  })
})

describe("changelog parser", () => {
  it("rejects what the pages could not show", () => {
    expect(() => parseEntry("2026-10-18-x", entry("tags: [nope]\n"))).toThrow(/unknown tag|tags/)
    expect(() => parseEntry("2026-10-19-x", entry())).toThrow(/start with its date/)
    expect(() => parseEntry("2026-10-18-x", entry().replace("One sentence.", "Two. Sentences."))).toThrow(/one sentence/)
    expect(() => parseEntry("2026-10-18-x", entry().replace("### New", "### Brand new"))).toThrow(/unknown heading/)
    expect(() => parseEntry("2026-10-18-x", entry() + "\n### New\n\n- again\n")).toThrow(/out of order or repeated/)
    expect(() => parseEntry("2026-10-18-x", entry() + [1, 2, 3, 4, 5, 6, 7].map((n) => `- line ${n}`).join("\n"))).toThrow(/at most 6/)
    expect(() => parseEntry("2026-10-18-x", entry('shot: /pricing\n'))).toThrow(/imageAlt/)
  })
  it("maps a screenshot page to light and dark files named after the entry", () => {
    const e = parseEntry("2026-10-18-x", entry('shot: /pricing\nimageAlt: "The pricing page."\n'))
    expect(e.image).toEqual({ light: "/changelog/2026-10-18-x.light.webp", dark: "/changelog/2026-10-18-x.dark.webp", alt: "The pricing page." })
  })
})

describe("feeds", () => {
  const rss = rssXml()
  const atom = atomXml()
  it("lists every entry with a permalink in RSS and Atom", () => {
    for (const e of getChangelog()) {
      expect(rss).toContain(`<guid isPermaLink="true">https://ui.ballmac.com/changelog/${e.slug}</guid>`)
      expect(atom).toContain(`<id>https://ui.ballmac.com/changelog/${e.slug}</id>`)
    }
    expect(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(atom).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
  })
  it("escapes markup and makes links absolute", () => {
    expect(inlineHtml("Use [the docs](/docs/x) with `<b>` & more", "https://ui.ballmac.com")).toBe('Use <a href="https://ui.ballmac.com/docs/x">the docs</a> with <code>&lt;b&gt;</code> &amp; more')
  })
  it("balances every tag", () => {
    for (const xml of [rss, atom]) {
      const open = (xml.match(/<(item|entry)>/g) ?? []).length
      const close = (xml.match(/<\/(item|entry)>/g) ?? []).length
      expect(open).toBe(close)
      expect(open).toBe(getChangelog().length)
    }
  })
})
