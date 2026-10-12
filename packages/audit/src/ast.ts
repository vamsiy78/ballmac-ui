import type * as TS from "typescript"

export type TsModule = typeof TS

export type JsxEl = {
  node: TS.JsxElement | TS.JsxSelfClosingElement
  opening: TS.JsxOpeningElement | TS.JsxSelfClosingElement
  /** "div", "Button", "Select.Item". */
  name: string
  /** A DOM element (lower case, no dot) rather than a component. */
  isHost: boolean
  attrs: Map<string, TS.JsxAttribute>
  /** The element spreads props ({...props}), so any attribute may arrive that way. */
  spread: boolean
  children: readonly TS.JsxChild[]
  parent?: JsxEl
}

/** Every JSX element in a file, each with its parent, in source order. */
export function collectJsx(ts: TsModule, sf: TS.SourceFile): JsxEl[] {
  const out: JsxEl[] = []
  const visit = (n: TS.Node, parent: JsxEl | undefined) => {
    let current = parent
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const opening = ts.isJsxElement(n) ? n.openingElement : n
      const name = opening.tagName.getText(sf)
      const attrs = new Map<string, TS.JsxAttribute>()
      let spread = false
      for (const a of opening.attributes.properties) {
        if (ts.isJsxSpreadAttribute(a)) spread = true
        else attrs.set(a.name.getText(sf), a)
      }
      const el: JsxEl = { node: n, opening, name, isHost: /^[a-z]/.test(name) && !name.includes("."), attrs, spread, children: ts.isJsxElement(n) ? n.children : [], parent }
      out.push(el)
      current = el
    }
    ts.forEachChild(n, (c) => visit(c, current))
  }
  visit(sf, undefined)
  return out
}

/** Identifier → module it was imported from, for default, named (by local name) and namespace imports. */
export function importsOf(ts: TsModule, sf: TS.SourceFile): Map<string, string> {
  const map = new Map<string, string>()
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue
    const from = st.moduleSpecifier.text
    const clause = st.importClause
    if (!clause) continue
    if (clause.name) map.set(clause.name.text, from)
    const nb = clause.namedBindings
    if (nb && ts.isNamedImports(nb)) for (const e of nb.elements) map.set(e.name.text, from)
    else if (nb && ts.isNamespaceImport(nb)) map.set(nb.name.text, from)
  }
  return map
}

/** Every string a node is built from: literals, template pieces and object keys (the class names in cn({ "a b": cond })). */
export function literalsIn(ts: TsModule, node: TS.Node): string[] {
  const out: string[] = []
  const visit = (n: TS.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      out.push(n.text)
      return
    }
    if (ts.isTemplateExpression(n)) {
      out.push(n.head.text)
      for (const s of n.templateSpans) {
        visit(s.expression)
        out.push(s.literal.text)
      }
      return
    }
    ts.forEachChild(n, visit)
  }
  visit(node)
  return out
}

/** The utility classes written in className (or class), split on spaces. Dynamic parts are not known and are left out. */
export function classTokens(ts: TsModule, el: JsxEl): string[] {
  const out: string[] = []
  for (const key of ["className", "class"]) {
    const attr = el.attrs.get(key)
    if (attr?.initializer) for (const s of literalsIn(ts, attr.initializer)) out.push(...s.split(/\s+/).filter(Boolean))
  }
  return out
}

/** The value of an attribute when it is a plain string; "" for a bare boolean attribute; undefined when it is computed. */
export function attrString(ts: TsModule, attr: TS.JsxAttribute | undefined): string | undefined {
  if (!attr) return undefined
  const init = attr.initializer
  if (!init) return ""
  if (ts.isStringLiteral(init)) return init.text
  if (ts.isJsxExpression(init) && init.expression) {
    const e = init.expression
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text
  }
  return undefined
}

export function attrNumber(ts: TsModule, attr: TS.JsxAttribute | undefined): number | undefined {
  if (!attr?.initializer) return undefined
  const init = attr.initializer
  const e = ts.isJsxExpression(init) ? init.expression : undefined
  if (e && ts.isNumericLiteral(e)) return Number(e.text)
  if (e && ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand)) return -Number(e.operand.text)
  if (ts.isStringLiteral(init) && /^-?\d+$/.test(init.text)) return Number(init.text)
  return undefined
}

/** The text of the attribute's expression, for loose "does it mention X" tests. */
export const attrText = (sf: TS.SourceFile, attr: TS.JsxAttribute | undefined) => attr?.initializer?.getText(sf) ?? ""

export function position(ts: TsModule, sf: TS.SourceFile, node: TS.Node) {
  const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf))
  return { line: line + 1, column: character + 1 }
}

const ICON_PACKAGES = /^(lucide-react|@radix-ui\/react-icons|react-icons(\/.*)?|@heroicons\/react(\/.*)?|@tabler\/icons-react|@phosphor-icons\/react|@iconify\/react|@mui\/icons-material(\/.*)?|@remixicon\/react|iconoir-react|@fortawesome\/react-fontawesome|@ballmac\/icons)$/

function isIcon(el: JsxEl, imports: Map<string, string>) {
  if (el.name === "svg") return true
  if (el.isHost) return false
  const root = el.name.split(".")[0]!
  if (/Icon$/.test(root)) return true
  const from = imports.get(root)
  return from !== undefined && ICON_PACKAGES.test(from)
}

export type Label = "named" | "icon-only" | "empty"

/**
 * Does a control's content give it a name? Only "icon-only" and "empty" are reported, so anything we cannot see into
 * (a variable, a call, a component that might render text) counts as named. A visually hidden span (sr-only) is a name.
 */
export function visibleLabel(ts: TsModule, el: JsxEl, children: readonly TS.JsxChild[], imports: Map<string, string>, all: Map<TS.Node, JsxEl>): Label {
  let icons = 0
  let anything = false
  const expressionKind = (e: TS.Expression): "icon" | "nothing" | "unknown" => {
    if (ts.isParenthesizedExpression(e)) return expressionKind(e.expression)
    if (e.kind === ts.SyntaxKind.NullKeyword || e.kind === ts.SyntaxKind.FalseKeyword || (ts.isIdentifier(e) && e.text === "undefined")) return "nothing"
    if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e)) {
      const el2 = all.get(e)
      return el2 && isIcon(el2, imports) ? "icon" : "unknown"
    }
    if (ts.isConditionalExpression(e)) {
      const a = expressionKind(e.whenTrue)
      const b = expressionKind(e.whenFalse)
      if (a === "unknown" || b === "unknown") return "unknown"
      return a === "icon" || b === "icon" ? "icon" : "nothing"
    }
    if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || e.operatorToken.kind === ts.SyntaxKind.BarBarToken || e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)) return expressionKind(e.right)
    return "unknown"
  }
  const walk = (list: readonly TS.JsxChild[]): boolean => {
    for (const c of list) {
      if (ts.isJsxText(c)) {
        if (c.text.trim()) return true
        continue
      }
      if (ts.isJsxExpression(c)) {
        if (!c.expression) continue
        anything = true
        const e = c.expression
        if ((ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) && !e.text.trim()) continue
        // {open ? <X /> : <Menu />} and {busy && <Spinner />}: when every branch is an icon, it is still icon-only.
        const kind = expressionKind(e)
        if (kind === "icon") {
          icons++
          continue
        }
        if (kind === "nothing") continue
        return true
      }
      if (ts.isJsxFragment(c)) {
        if (walk(c.children)) return true
        continue
      }
      if (ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c)) {
        anything = true
        const child = all.get(c)
        if (!child) return true
        if (isIcon(child, imports)) {
          icons++
          // An SVG can carry its own name with <title>.
          if (child.name === "svg" && child.children.some((k) => (ts.isJsxElement(k) && k.openingElement.tagName.getText() === "title"))) return true
          continue
        }
        if (child.isHost && classTokens(ts, child).includes("sr-only")) return true
        if (child.isHost) {
          if (child.attrs.has("aria-label") || child.attrs.has("title")) return true
          if (walk(child.children)) return true
          continue
        }
        // A component we cannot see into may render text.
        return true
      }
    }
    return false
  }
  if (walk(children)) return "named"
  if (icons > 0) return "icon-only"
  return anything ? "named" : "empty"
}
