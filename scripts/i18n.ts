/**
 * Built-in strings of components go through `msg(key, english)` from `@/lib/ballmac/i18n`, so one provider can translate them.
 *
 *   tsx scripts/i18n.ts          report strings that are not routed through msg (exit 1 if any)
 *   tsx scripts/i18n.ts --fix    rewrite them in place (and add the "i18n" registry dependency)
 *   tsx scripts/i18n.ts --list   print the key → English table
 *
 * Covered: aria-label, aria-description, placeholder (and title on plain HTML elements) with a string value; text inside
 * `sr-only` elements; visible text of plain HTML elements and common controls; and label-like props with an English default
 * (`closeLabel = "Close"`), which keep working as props and now fall back to the dictionary.
 * A line with `i18n-ignore` in a comment is skipped (sample values, file extensions).
 * Not covered: sample content (templates, blocks' demo copy passed as props), code samples, brand names.
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs"
import { join, relative, basename } from "node:path"
import ts from "typescript"

const ROOT = join(import.meta.dirname, "..")
const SCOPES = ["registry/ballmac/components"]
// Blocks and templates are starting points whose copy you edit; only the components carry built-in text.
const SKIP_DIRS = new Set(["templates", "blocks"])
const SKIP_FILES = new Set(["registry/ballmac/components/mac-icons.tsx"])

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) return SKIP_DIRS.has(n) ? [] : walk(p)
    return p.endsWith(".tsx") ? [p] : []
  })
}

const ATTRS = new Set(["aria-label", "aria-description", "placeholder"])
const TITLE_ON = /^[a-z]/ // title only on plain HTML elements; on components it is usually content
const LABEL_PROP = /(Label|label|Text|text|Title|title|Placeholder|placeholder|Description|description|Heading|heading|Message|message|Empty|empty|Hint|hint|Caption|caption)$/
const TEXT_PARENTS = /^(button|label|span|p|h[1-6]|li|th|td|legend|summary|a|strong|em|small|figcaption|Button|Badge|Label|DialogTitle|DialogDescription|SheetTitle|SheetDescription|AlertTitle|AlertDescription|CardTitle|CardDescription|DropdownMenuItem|DropdownMenuLabel|SelectItem|TabsTrigger|Kbd|EmptyTitle|EmptyDescription)$/
const NO_TEXT_ANCESTORS = new Set(["code", "pre", "kbd", "samp", "svg", "text", "tspan"])

const words = (s: string) => s.replace(/[^A-Za-z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean)
const camel = (s: string) => words(s).slice(0, 5).map((w, i) => (i ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join("")
const hasLetters = (s: string) => /[A-Za-z]{2,}/.test(s)
const looksEnglish = (s: string) => hasLetters(s) && (/^[A-Z]/.test(s) || /\s/.test(s) || s.endsWith("…"))

type Edit = { start: number; end: number; text: string }
type Finding = { file: string; line: number; text: string }

const srOnlyOrSimple = (tag: string) => tag === "code" || tag === "kbd"

function tagName(node: ts.Node): string | undefined {
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText()
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) return node.tagName.getText()
  return undefined
}

/** The nearest enclosing component: a function declared with a capitalised name (possibly wrapped in forwardRef/memo). */
function enclosingComponent(node: ts.Node): ts.FunctionLikeDeclaration | undefined {
  for (let n: ts.Node | undefined = node.parent; n; n = n.parent) {
    if (ts.isFunctionDeclaration(n) && n.name && /^[A-Z]/.test(n.name.text)) return n
    if ((ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && ts.isVariableDeclaration(n.parent) && ts.isIdentifier(n.parent.name) && /^[A-Z]/.test(n.parent.name.text)) return n
    if ((ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && ts.isCallExpression(n.parent) && /^(React\.)?(forwardRef|memo)$/.test(n.parent.expression.getText())) {
      const decl = n.parent.parent
      if (decl && ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name) && /^[A-Z]/.test(decl.name.text)) return n
    }
  }
  return undefined
}

export type Row = { key: string; text: string; file: string }

function analyse(file: string, code: string, fix: boolean): { code: string; findings: Finding[]; rows: Row[]; changed: boolean } {
  const rel = relative(ROOT, file)
  const base = basename(file, ".tsx")
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const client = /^\s*(\/\/[^\n]*\n\s*)*["']use client["']/.test(code)
  const edits: Edit[] = []
  const findings: Finding[] = []
  const rows: Row[] = []
  const needsMsg = new Set<ts.Node>()
  const usedKeys = new Map<string, string>()
  const lineOf = (n: ts.Node) => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1
  const ignored = (n: ts.Node) => (code.split("\n")[lineOf(n) - 1] ?? "").includes("i18n-ignore")

  const key = (text: string, hint?: string) => {
    let k = `${base}.${hint ?? (camel(text) || "text")}`
    // Two different strings must not share a key.
    for (let i = 2; usedKeys.has(k) && usedKeys.get(k) !== text; i++) k = `${base}.${hint ?? camel(text)}${i}`
    usedKeys.set(k, text)
    return k
  }
  const call = (text: string, k: string) => `msg(${JSON.stringify(k)}, ${JSON.stringify(text)})`

  function record(node: ts.Node, text: string, replacement: Edit | null, hint?: string) {
    if (ignored(node)) return
    const comp = enclosingComponent(node)
    if (!comp) {
      findings.push({ file: rel, line: lineOf(node), text: `"${text}" is outside a component; route it through msg by hand` })
      return
    }
    if (!client) {
      findings.push({ file: rel, line: lineOf(node), text: `"${text}" (server component: add "use client" first)` })
      return
    }
    findings.push({ file: rel, line: lineOf(node), text: `"${text}" is not translatable` })
    if (replacement) {
      const k = key(text, hint)
      rows.push({ key: k, text, file: rel })
      edits.push({ ...replacement, text: replacement.text.replace("__CALL__", call(text, k)) })
      needsMsg.add(comp)
    }
  }

  function stringsIn(expr: ts.Expression, out: ts.StringLiteral[] = []) {
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) out.push(expr as ts.StringLiteral)
    else if (ts.isConditionalExpression(expr)) {
      stringsIn(expr.whenTrue, out)
      stringsIn(expr.whenFalse, out)
    } else if (ts.isParenthesizedExpression(expr)) stringsIn(expr.expression, out)
    else if (ts.isBinaryExpression(expr) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(expr.operatorToken.kind)) {
      stringsIn(expr.left, out)
      stringsIn(expr.right, out)
    }
    return out
  }

  /** `Select row ${i + 1}` becomes msg("key", "Select row {n}", { n: i + 1 }). Only simple substitutions are rewritten. */
  function templated(t: ts.TemplateExpression) {
    const names = new Map<string, number>()
    const values: string[] = []
    let template = t.head.text
    for (const span of t.templateSpans) {
      const e = span.expression
      let name: string | null = null
      if (ts.isIdentifier(e)) name = e.text
      else if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.name) && !e.questionDotToken) name = e.name.text
      else if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken && ts.isNumericLiteral(e.right)) name = "n"
      else if (ts.isElementAccessExpression(e) || ts.isCallExpression(e)) name = null
      if (!name || /^(\d)/.test(name)) {
        findings.push({ file: rel, line: lineOf(t), text: "template literal with a complex substitution; route it through msg by hand" })
        return
      }
      const used = names.get(name) ?? 0
      names.set(name, used + 1)
      const unique = used ? `${name}${used + 1}` : name
      template += `{${unique}}` + span.literal.text
      values.push(unique === name && ts.isIdentifier(e) && e.text === name ? name : `${unique}: ${e.getText()}`)
    }
    if (!hasLetters(template.replace(/\{\w+\}/g, ""))) return
    const comp = enclosingComponent(t)
    if (!comp) {
      findings.push({ file: rel, line: lineOf(t), text: "template literal outside a component; route it through msg by hand" })
      return
    }
    findings.push({ file: rel, line: lineOf(t), text: `\`${template}\` is not translatable` })
    if (!client) return
    const k = key(template, camel(template.replace(/\{\w+\}/g, " ")) || "text")
    rows.push({ key: k, text: template, file: rel })
    const entries = values.map((v) => (v.includes(":") ? v : v)).join(", ")
    edits.push({ start: t.getStart(), end: t.getEnd(), text: `msg(${JSON.stringify(k)}, ${JSON.stringify(template)}, { ${entries} })` })
    needsMsg.add(comp)
  }

  function visit(node: ts.Node) {
    // aria-label="…", placeholder="…", title="…"
    if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText()
      const tag = tagName(node.parent.parent) ?? ""
      if (ATTRS.has(name) || (name === "title" && TITLE_ON.test(tag))) {
        if (ts.isStringLiteral(node.initializer)) {
          const text = node.initializer.text
          if (hasLetters(text)) record(node, text, { start: node.initializer.getStart(), end: node.initializer.getEnd(), text: "{__CALL__}" })
        } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
          const expr = node.initializer.expression
          if (ts.isTemplateExpression(expr)) templated(expr)
          for (const lit of stringsIn(expr)) {
            if (hasLetters(lit.text)) record(lit, lit.text, { start: lit.getStart(), end: lit.getEnd(), text: "__CALL__" })
          }
        }
      }
    }
    // Text in sr-only elements, and visible text of simple elements.
    if (ts.isJsxText(node) && !node.containsOnlyTriviaWhiteSpaces) {
      const raw = node.text
      const text = raw.replace(/\s+/g, " ").trim()
      const el = node.parent
      const tag = ts.isJsxElement(el) ? el.openingElement.tagName.getText() : ""
      const cls = ts.isJsxElement(el) ? el.openingElement.attributes.getText() : ""
      let inCode = false
      for (let n: ts.Node | undefined = el; n; n = n.parent) if ((ts.isJsxElement(n) && NO_TEXT_ANCESTORS.has(n.openingElement.tagName.getText()))) inCode = true
      const srOnly = /sr-only/.test(cls)
      // Text that sits next to an expression ("{n} items", "of {total}") cannot be translated as a fragment; report it for hand-editing.
      const mixed = ts.isJsxElement(el) && el.children.some((c) => ts.isJsxExpression(c)) && !srOnlyOrSimple(tag)
      if (!inCode && mixed && hasLetters(text) && !ignored(node)) {
        findings.push({ file: rel, line: lineOf(node), text: `"${text}" sits next to an expression; make it one msg(key, "…{value}…", { value })` })
      }
      if (!inCode && hasLetters(text) && text.length <= 70 && !/[{}<>=]/.test(text) && (srOnly || (TEXT_PARENTS.test(tag) && /^[A-Z]/.test(text)))) {
        const lead = raw.match(/^\s*/)![0]
        const trail = raw.match(/\s*$/)![0]
        record(node, text, { start: node.getStart(sf, true) - 0, end: node.getEnd(), text: `${lead.includes("\n") ? lead : lead ? " " : ""}{__CALL__}${trail.includes("\n") ? trail : trail ? " " : ""}` })
        // JsxText.getStart skips leading whitespace; replace the whole raw run instead.
        const e = edits[edits.length - 1]
        if (e) {
          e.start = node.pos
          e.end = node.end
        }
      }
    }
    // closeLabel = "Close" in a destructured parameter.
    if (ts.isBindingElement(node) && node.initializer && ts.isStringLiteral(node.initializer) && ts.isIdentifier(node.name) && LABEL_PROP.test(node.name.text)) {
      const p = node.parent.parent
      const fn = ts.isParameter(p) ? p.parent : undefined
      const text = node.initializer.text
      if (fn && ts.isParameter(p) && p === (fn as ts.FunctionLikeDeclaration).parameters[0] && looksEnglish(text) && enclosingComponent(node.initializer) === fn) {
        const prop = node.name.text
        const comp = fn as ts.FunctionLikeDeclaration
        const k = key(text, prop)
        findings.push({ file: rel, line: lineOf(node), text: `${prop} = "${text}" is not translatable` })
        if (client) {
          rows.push({ key: k, text, file: rel })
          edits.push({ start: node.initializer.getStart() - 3, end: node.initializer.getEnd(), text: "" }) // " = " + literal; fixed below
          const last = edits[edits.length - 1]!
          // Remove from the end of the name to the end of the literal.
          last.start = node.name.getEnd()
          pendingAssign.push({ comp, line: `${prop} ??= ${call(text, k)}` })
          needsMsg.add(comp)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  const pendingAssign: { comp: ts.FunctionLikeDeclaration; line: string }[] = []
  visit(sf)

  // One `const msg = useMessages()` at the top of each component that uses it, followed by any `prop ??= …` lines.
  const byComp = new Map<ts.FunctionLikeDeclaration, string[]>()
  for (const c of needsMsg) byComp.set(c as ts.FunctionLikeDeclaration, [])
  for (const a of pendingAssign) byComp.get(a.comp)?.push(a.line)
  for (const [comp, lines] of byComp) {
    const body = comp.body
    if (!body || !ts.isBlock(body)) {
      findings.push({ file: rel, line: lineOf(comp), text: "component has an expression body; add `const msg = useMessages()` by hand" })
      continue
    }
    if (/\bconst msg = useMessages\(\)/.test(body.getText())) {
      // Already set up by an earlier run: only add the new prop fallbacks.
      const first0 = body.statements.find((st) => st.getText().startsWith("const msg = useMessages()"))
      if (first0 && lines.length) edits.push({ start: first0.getEnd(), end: first0.getEnd(), text: lines.map((l) => `\n${" ".repeat(sf.getLineAndCharacterOfPosition(first0.getStart()).character)}${l}`).join("") })
      continue
    }
    const first = body.statements[0]
    const indent = first ? " ".repeat(sf.getLineAndCharacterOfPosition(first.getStart()).character) : "  "
    const at = body.getStart() + 1
    edits.push({ start: at, end: at, text: `\n${indent}const msg = useMessages()${lines.map((l) => `\n${indent}${l}`).join("")}` })
  }

  if (!fix || !edits.length) return { code, findings, rows, changed: false }

  let out = code
  for (const e of edits.sort((a, b) => b.start - a.start || b.end - a.end)) out = out.slice(0, e.start) + e.text + out.slice(e.end)
  if (!/lib\/ballmac\/i18n/.test(out) && byComp.size) {
    const imports = [...ts.createSourceFile(file, out, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX).statements].filter(ts.isImportDeclaration)
    const semi = /;\s*$/.test(code.split("\n").find((l) => l.startsWith("import ")) ?? "") ? ";" : ""
    const line = `import { useMessages } from "@/lib/ballmac/i18n"${semi}\n`
    const lastImport = imports[imports.length - 1]
    if (lastImport) {
      const pos = lastImport.getEnd()
      out = out.slice(0, pos) + "\n" + line.trimEnd() + out.slice(pos)
    }
  }
  return { code: out, findings, rows, changed: out !== code }
}

function metaFor(rel: string): string | null {
  const dir = join(ROOT, "registry/ballmac")
  const target = relative(dir, join(ROOT, rel))
  const stack = [dir]
  while (stack.length) {
    const d = stack.pop()!
    for (const n of readdirSync(d)) {
      const p = join(d, n)
      if (statSync(p).isDirectory()) stack.push(p)
      else if (n.endsWith(".meta.ts") && readFileSync(p, "utf8").includes(`path: "${target}"`)) return p
    }
  }
  return null
}

function addDependency(metaPath: string, dep: string) {
  let s = readFileSync(metaPath, "utf8")
  const m = s.match(/registryDependencies:\s*\[([^\]]*)\]/)
  if (m) {
    const items = m[1]!.split(",").map((x) => x.trim()).filter(Boolean)
    if (items.includes(`"${dep}"`)) return
    items.push(`"${dep}"`)
    s = s.replace(m[0], `registryDependencies: [${items.join(", ")}]`)
  } else s = s.replace(/(\n\s*files:\s*\[[^\]]*\],)/, `$1\n  registryDependencies: ["${dep}"],`)
  writeFileSync(metaPath, s)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fix = process.argv.includes("--fix")
  const list = process.argv.includes("--list")
  const all: Finding[] = []
  const rows: Row[] = []
  let changed = 0
  for (const abs of [...new Set(SCOPES.flatMap((d) => walk(join(ROOT, d))))]) {
    const rel = relative(ROOT, abs)
    if (SKIP_FILES.has(rel)) continue
    const code = readFileSync(abs, "utf8")
    const r = analyse(abs, code, fix)
    rows.push(...r.rows)
    if (r.changed) {
      writeFileSync(abs, r.code)
      changed++
      const meta = metaFor(rel)
      if (meta) addDependency(meta, "i18n")
      else console.warn(`no meta found for ${rel}`)
    }
    all.push(...r.findings)
  }
  if (list) {
    const out: Record<string, string> = {}
    for (const r of rows) out[r.key] = r.text
    console.log(JSON.stringify(out, null, 2))
  } else {
    if (fix) console.log(`rewrote ${changed} file(s)`)
    const remaining = fix ? all.filter((f) => !/is not translatable/.test(f.text) || false) : all
    if (remaining.length) {
      const byFile = new Map<string, Finding[]>()
      for (const f of remaining) byFile.set(f.file, [...(byFile.get(f.file) ?? []), f])
      console.error(`✗ ${remaining.length} string(s) not routed through msg in ${byFile.size} file(s):`)
      for (const [f, l] of [...byFile].slice(0, 80)) console.error(`  ${f}\n${l.slice(0, 5).map((x) => `    ${x.line}: ${x.text}`).join("\n")}`)
      process.exit(1)
    }
    console.log(`✓ i18n: every built-in string in components goes through msg()`)
  }
}
