/**
 * Right-to-left support for registry source.
 *
 *   tsx scripts/rtl.ts            report physical-direction classes and unmirrored directional icons (exit 1 if any)
 *   tsx scripts/rtl.ts --fix      rewrite the safe ones in place
 *
 * Safe rewrites: ml/mr/pl/pr → ms/me/ps/pe, left/right → start/end, text-left/right → text-start/end,
 * border-l/r → border-s/e, rounded-l/r/tl/tr/bl/br → rounded-s/e/ss/se/es/ee, float and clear.
 * Left alone on purpose: `left-1/2` and `right-1/2` (centering with a translate is symmetric), and anything listed in
 * `scripts/rtl-exceptions.json` with a reason. Directional icons (arrows and chevrons) must carry an `rtl:` class.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const DIRS = ["registry/ballmac", "registry/examples", "registry/pro/ballmac", "registry/pro/examples"]

const exceptions: { file: string; reason: string; allow?: string[] }[] = JSON.parse(readFileSync(join(import.meta.dirname, "rtl-exceptions.json"), "utf8"))

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : []
  })
}

const sides: Record<string, string> = { l: "s", r: "e" }
const corners: Record<string, string> = { l: "s", r: "e", tl: "ss", tr: "se", bl: "es", br: "ee" }

/** Maps one utility (no variants, no `-` or `!`) to its logical twin, or null if it needs no change. */
function logical(util: string): string | null {
  let m: RegExpMatchArray | null
  if ((m = util.match(/^(m|p|scroll-m|scroll-p)([lr])-(.+)$/))) return `${m[1]}${sides[m[2]!]}-${m[3]}`
  if ((m = util.match(/^(left|right)-(.+)$/))) {
    if (m[2] === "1/2") return null
    return `${m[1] === "left" ? "start" : "end"}-${m[2]}`
  }
  if ((m = util.match(/^text-(left|right)$/))) return `text-${m[1] === "left" ? "start" : "end"}`
  if ((m = util.match(/^(float|clear)-(left|right)$/))) return `${m[1]}-${m[2] === "left" ? "start" : "end"}`
  if ((m = util.match(/^border-([lr])(-.+)?$/))) return `border-${sides[m[1]!]}${m[2] ?? ""}`
  if ((m = util.match(/^rounded-(l|r|tl|tr|bl|br)(-.+)?$/))) return `rounded-${corners[m[1]!]}${m[2] ?? ""}`
  return null
}

/** Splits `a:b:[&:hover]:ml-2` into its variant prefix (up to the last colon outside brackets) and the utility. */
function split(token: string) {
  let depth = 0
  let cut = -1
  for (let i = 0; i < token.length; i++) {
    const c = token[i]
    if (c === "[" || c === "(") depth++
    else if (c === "]" || c === ")") depth--
    else if (c === ":" && depth === 0) cut = i
  }
  return { prefix: token.slice(0, cut + 1), util: token.slice(cut + 1) }
}

export function fixToken(token: string): string {
  const { prefix, util } = split(token)
  const bang = util.startsWith("!") ? "!" : ""
  const rest = util.slice(bang.length)
  const neg = rest.startsWith("-") ? "-" : ""
  const out = logical(rest.slice(neg.length))
  return out ? `${prefix}${bang}${neg}${out}` : token
}

// Tokens are runs between whitespace and quote characters; class lists live in string literals.
const TOKEN = /[^\s"'`{}]+/g

/** A line that carries `rtl-fixed` in a comment is physical on purpose (a fixed screen edge, a hardware part). */
const FIXED = "rtl-fixed"

export function fixClasses(code: string): string {
  return code
    .split("\n")
    .map((line) => (line.includes(FIXED) ? line : line.replace(TOKEN, (t) => (/^[-!a-z0-9[]/.test(t) && !t.includes("://") ? fixToken(t) : t))))
    .join("\n")
}

// Icons whose meaning has a direction. A horizontally symmetric glyph (chevron, straight arrow) mirrors by turning 180 degrees.
const ROTATE = /^(ArrowRight|ArrowLeft|ChevronRight|ChevronLeft|ChevronsRight|ChevronsLeft|ChevronFirst|ChevronLast|MoveRight|MoveLeft|ArrowBigRight|ArrowBigLeft|ArrowRightToLine|ArrowLeftToLine|CircleArrowRight|CircleArrowLeft|SquareArrowRight|SquareArrowLeft)$/
const FLIP = /^(ArrowUpRight|ArrowUpLeft|ArrowDownRight|ArrowDownLeft|CornerDownRight|CornerDownLeft|CornerUpRight|CornerUpLeft|Undo|Undo2|Redo|Redo2|Reply|Forward|PanelLeft|PanelRight|PanelLeftClose|PanelLeftOpen|PanelRightClose|PanelRightOpen|SidebarOpen|SidebarClose|IndentIncrease|IndentDecrease|Send|SendHorizontal|ListIndentIncrease|ListIndentDecrease|TextQuote|Quote)$/
export const rtlClass = (name: string) => (ROTATE.test(name) ? "rtl:rotate-180" : FLIP.test(name) ? "rtl:-scale-x-100" : null)

const ICON = /<([A-Z][A-Za-z0-9]*)((?:\s[^<>]*?)?)(\/?>)/g

/** Adds the `rtl:` class to directional icons written as `<Icon />` with no className or a plain string className. */
/** Names imported from lucide-react in this file (a local component can share an icon's name). */
export function lucideNames(code: string): Set<string> {
  const names = new Set<string>()
  for (const m of code.matchAll(/import\s*\{([^}]*)\}\s*from\s*"lucide-react"/g))
    for (const part of m[1]!.split(",")) if (part.trim()) names.add(part.trim().split(/\s+as\s+/).pop()!.trim())
  return names
}

export function fixIcons(code: string): { code: string; manual: string[] } {
  const manual: string[] = []
  const icons = lucideNames(code)
  const out = code.replace(ICON, (all, name: string, attrs: string, end: string) => {
    if (!icons.has(name)) return all
    const cls = rtlClass(name)
    if (!cls || !/\/>$/.test(end)) return all
    if (/rtl:/.test(attrs)) return all
    const str = attrs.match(/className="([^"]*)"/)
    if (str) {
      if (/\b(rotate|scale)-|transition-transform/.test(str[1]!)) {
        manual.push(`${name} has its own rotate or scale: ${str[1]}`)
        return all
      }
      return `<${name}${attrs.replace(str[0], `className="${str[1]} ${cls}"`)}${end}`
    }
    if (/className=/.test(attrs)) {
      manual.push(`${name} has a dynamic className`)
      return all
    }
    return `<${name}${attrs} className="${cls}"${end}`
  })
  return { code: out, manual }
}

function exceptionFor(file: string) {
  return exceptions.find((e) => file === e.file || (e.file.endsWith("/") && file.startsWith(e.file)))
}

type Finding = { file: string; line: number; text: string }

function scan(file: string, code: string): Finding[] {
  const found: Finding[] = []
  const lines = code.split("\n")
  const icons = lucideNames(code)
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line) || line.includes(FIXED)) return
    for (const m of line.matchAll(TOKEN)) {
      const t = m[0]
      if (/^[-!a-z0-9[]/.test(t) && !t.includes("://") && fixToken(t) !== t) found.push({ file, line: i + 1, text: `${t} → ${fixToken(t)}` })
    }
    for (const m of line.matchAll(ICON)) {
      if (icons.has(m[1]!) && rtlClass(m[1]!) && /\/>$/.test(m[3]!) && !/rtl:/.test(m[2]!)) found.push({ file, line: i + 1, text: `<${m[1]}> needs ${rtlClass(m[1]!)}` })
    }
    if (/\b(margin|padding)(Left|Right)\b|\b(marginInline|insetInline)\b/.test(line) && /(Left|Right)/.test(line))
      found.push({ file, line: i + 1, text: "inline style uses a physical side; use marginInlineStart/End or insetInlineStart" })
  })
  return found
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fix = process.argv.includes("--fix")
  const files = DIRS.flatMap((d) => walk(join(ROOT, d)))
  const problems: Finding[] = []
  const manualAll: string[] = []
  let changed = 0
  for (const abs of files) {
    const file = relative(ROOT, abs)
    const ex = exceptionFor(file)
    if (ex) continue
    let code = readFileSync(abs, "utf8")
    if (fix) {
      const a = fixClasses(code)
      const b = fixIcons(a)
      b.manual.forEach((m) => manualAll.push(`${file}: ${m}`))
      if (b.code !== code) {
        writeFileSync(abs, b.code)
        changed++
      }
      code = b.code
    }
    problems.push(...scan(file, code))
  }
  if (fix) console.log(`rewrote ${changed} file(s)`)
  manualAll.forEach((m) => console.log("manual:", m))
  if (problems.length) {
    const byFile = new Map<string, Finding[]>()
    for (const p of problems) byFile.set(p.file, [...(byFile.get(p.file) ?? []), p])
    console.error(`✗ ${problems.length} physical-direction problem(s) in ${byFile.size} file(s):`)
    for (const [f, list] of [...byFile].slice(0, 60)) console.error(`  ${f}\n${list.slice(0, 4).map((p) => `    ${p.line}: ${p.text}`).join("\n")}`)
    process.exit(1)
  }
  console.log(`✓ RTL: no physical-direction classes or unmirrored directional icons in ${files.length} file(s)`)
}
