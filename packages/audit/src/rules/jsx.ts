import type * as TS from "typescript"

import { attrNumber, attrString, attrText, classTokens, collectJsx, importsOf, position, visibleLabel, type JsxEl, type TsModule } from "../ast.js"
import type { Catalog, Config, RuleLevel, Severity } from "../types.js"

export type FileCtx = {
  ts: TsModule
  sf: TS.SourceFile
  text: string
  catalog?: Catalog
  config: Config
  /** The app uses shadcn-style CSS variable tokens (components.json says cssVariables), so fixed colours are a real problem. */
  tokensApp: boolean
  level: (rule: string) => RuleLevel
  report: (rule: string, at: TS.Node | { line: number; column: number }, message: string, opts?: { fix?: string; severity?: Severity }) => void
}

const NON_INTERACTIVE = new Set(["div", "span", "li", "ul", "ol", "p", "section", "article", "header", "footer", "main", "aside", "nav", "img", "svg", "td", "tr", "th", "h1", "h2", "h3", "h4", "h5", "h6", "figure"])
const BUTTONISH = new Set(["button", "Button", "IconButton", "ToggleButton"])
const LINKISH = new Set(["a", "Link", "NextLink"])
const FOCUS_STYLE = /^(?:[a-z0-9-]+:)*focus(?:-visible|-within)?:(?!outline-none|outline-0|outline-hidden)/
const DIALOG_LIB = /dialog|sheet|drawer|modal|popover|vaul|headlessui|radix-ui|react-aria|ark-ui|base-ui|reach-ui|overlay/i
const DATA_HOOK_MODULES = /react-query|swr|@trpc|urql|@apollo|convex|use-resource/i
const DATA_HOOKS = new Set(["useQuery", "useInfiniteQuery", "useSuspenseQuery", "useQueries", "useSWR", "useSWRInfinite", "useSWRImmutable", "useResource", "useLazyQuery"])
const STATE_WORDS = /\b(isLoading|isPending|isFetching|isError|isSuccess|isLoadingError|isRefetching|error|status|fetchStatus|loading|networkStatus)\b/
const FORM_WRAPPERS = new Set(["Label", "label", "Field", "FieldLabel", "FormField", "FormItem", "FormControl", "FormLabel", "InputGroup"])

/** Class names of every ancestor, nearest first (cached per element). */
const ancestorCache = new WeakMap<object, string[]>()
function ancestorTokens(ts: TsModule, el: JsxEl): string[] {
  const hit = ancestorCache.get(el)
  if (hit) return hit
  const out: string[] = []
  for (let p = el.parent; p; p = p.parent) out.push(...classTokens(ts, p))
  ancestorCache.set(el, out)
  return out
}
const hiddenFromAssistive = (el: JsxEl) => {
  for (let p: JsxEl | undefined = el; p; p = p.parent) if (p.attrs.has("aria-hidden") || p.attrs.has("hidden") || p.attrs.has("inert")) return true
  return false
}
const SCROLLER = /^(?:overflow|overflow-x)-(?:auto|scroll|hidden|clip)$/

const variantOf = (t: string) => (t.includes(":") ? t.slice(0, t.lastIndexOf(":") + 1) : "")
const baseOf = (t: string) => (t.includes(":") ? t.slice(t.lastIndexOf(":") + 1) : t)
const hasAncestor = (el: JsxEl, names: Set<string>) => {
  for (let p = el.parent; p; p = p.parent) if (names.has(p.name)) return true
  return false
}

const NEUTRAL = /^(?:bg|text|border|ring|fill|stroke|outline|decoration|divide|shadow|from|via|to|caret|accent|placeholder)-(?:(?:white|black)|(?:slate|gray|zinc|neutral|stone)-\d{2,3})(?:\/\d+)?$/
const ARBITRARY_COLOR = /^(?:bg|text|border|ring|fill|stroke|outline|decoration|divide|shadow|from|via|to|caret|accent|placeholder)-\[(?:#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla|oklch|oklab|color)\()/
const CHROMATIC = /^(?:bg|text|border|ring|fill|stroke|outline|decoration|divide|shadow|from|via|to|caret|accent|placeholder)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?:\/\d+)?$/

const PHYSICAL: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(m|p|scroll-m|scroll-p)([lr])-(.+)$/, (m) => `${m[1]}${m[2] === "l" ? "s" : "e"}-${m[3]}`],
  [/^(left|right)-(?!1\/2$)(.+)$/, (m) => `${m[1] === "left" ? "start" : "end"}-${m[2]}`],
  [/^text-(left|right)$/, (m) => `text-${m[1] === "left" ? "start" : "end"}`],
  [/^(float|clear)-(left|right)$/, (m) => `${m[1]}-${m[2] === "left" ? "start" : "end"}`],
  [/^border-([lr])(-.+)?$/, (m) => `border-${m[1] === "l" ? "s" : "e"}${m[2] ?? ""}`],
  [/^rounded-(l|r|tl|tr|bl|br)(-.+)?$/, (m) => `rounded-${({ l: "s", r: "e", tl: "ss", tr: "se", bl: "es", br: "ee" } as Record<string, string>)[m[1]!]}${m[2] ?? ""}`],
]

const short = (list: string[], n = 4) => (list.length > n ? `${list.slice(0, n).join(", ")} and ${list.length - n} more` : list.join(", "))

/** Runs every syntax-aware rule over one parsed file. */
export function runJsxRules(ctx: FileCtx) {
  const { ts, sf, text, report, level } = ctx
  const els = collectJsx(ts, sf)
  const byNode = new Map<TS.Node, JsxEl>(els.map((e) => [e.node, e]))
  const imports = importsOf(ts, sf)
  const on = (r: string) => level(r) !== "off"

  // states/ballmac-state-prop
  if (on("states/ballmac-state-prop") && ctx.catalog) {
    const owner = new Map<string, { name: string; states: string[] }>()
    // Only the main export carries the state prop; an item may export helpers beside it that do not.
    for (const [name, item] of Object.entries(ctx.catalog)) if (item.states?.length && item.exports?.[0]) owner.set(item.exports[0], { name, states: item.states })
    for (const el of els) {
      if (el.isHost) continue
      const root = el.name.split(".")[0]!
      const from = imports.get(root)
      const hit = owner.get(root)
      if (!hit || !from || !/(^|\/)ballmac(\/|$)/.test(from)) continue
      if (el.attrs.has("state") || el.spread) continue
      report("states/ballmac-state-prop", el.opening, `<${el.name}> can show ${short(hit.states)}, but this use never passes a state prop.`)
    }
  }

  // states/data-without-states
  if (on("states/data-without-states")) {
    const hooks = [...imports].filter(([id, from]) => DATA_HOOKS.has(id) && DATA_HOOK_MODULES.test(from)).map(([id]) => id)
    if (hooks.length && !STATE_WORDS.test(text) && !/<Suspense\b|ErrorBoundary|useSuspenseQuery/.test(text)) {
      let first: TS.Node | undefined
      const visit = (n: TS.Node) => {
        if (first) return
        if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && hooks.includes(n.expression.text)) first = n
        else ts.forEachChild(n, visit)
      }
      visit(sf)
      if (first) report("states/data-without-states", first, `${(first as TS.CallExpression).expression.getText(sf)} is used, but nothing in this file reads a loading or error value.`)
    }
  }

  for (const el of els) {
    const tokens = classTokens(ts, el)
    const name = el.name

    // a11y/img-alt
    if (on("a11y/img-alt")) {
      const nextImage = name === "Image" && /^next\/(legacy\/)?image$/.test(imports.get("Image") ?? "")
      if ((name === "img" || nextImage) && !el.attrs.has("alt") && !el.spread) report("a11y/img-alt", el.opening, `<${name}> has no alt attribute.`)
    }

    // a11y/control-name
    if (on("a11y/control-name")) {
      const role = attrString(ts, el.attrs.get("role"))
      const target = BUTTONISH.has(name) || LINKISH.has(name) || (el.isHost && role === "button")
      const named = el.attrs.has("aria-label") || el.attrs.has("aria-labelledby") || el.attrs.has("title") || el.attrs.has("aria-hidden") || el.attrs.has("children")
      if (target && !named && !hiddenFromAssistive(el)) {
        const label = visibleLabel(ts, el, el.children, imports, byNode)
        if (label === "icon-only") report("a11y/control-name", el.opening, `<${name}> contains only an icon and has no accessible name.`)
        else if (label === "empty" && !el.spread && (name === "button" || name === "a" || name === "Button")) report("a11y/control-name", el.opening, `<${name}> is empty and has no accessible name.`)
      }
    }

    // a11y/clickable-non-interactive
    if (on("a11y/clickable-non-interactive") && el.isHost && NON_INTERACTIVE.has(name)) {
      const click = el.attrs.get("onClick")
      const role = attrString(ts, el.attrs.get("role"))
      if (click && role !== "presentation" && role !== "none" && !el.attrs.has("aria-hidden") && !/stopPropagation/.test(attrText(sf, click))) {
        const hasKey = ["onKeyDown", "onKeyUp", "onKeyPress"].some((k) => el.attrs.has(k))
        if (!el.attrs.has("role") && !el.attrs.has("tabIndex")) report("a11y/clickable-non-interactive", el.opening, `<${name}> has onClick but is not focusable and has no role.`)
        else if (!hasKey) report("a11y/clickable-non-interactive", el.opening, `<${name}> has onClick and a role but no keyboard handler (onKeyDown).`)
      }
    }

    // a11y/focus-outline-removed
    if (on("a11y/focus-outline-removed")) {
      // tabIndex={-1} is focus from code only (a heading that receives focus after a route change): no outline is the norm there.
      const tab = attrNumber(ts, el.attrs.get("tabIndex"))
      const focusable = el.isHost && (["button", "a", "input", "select", "textarea", "summary"].includes(name) || (tab !== undefined && tab >= 0))
      const removes = tokens.some((t) => /^outline-(?:none|0)$/.test(baseOf(t)))
      // A wrapper can draw the ring for its field: focus-within:ring-* or has-[:focus-visible]:ring-*.
      const wrapped = ancestorTokens(ts, el).some((t) => /focus-within:|has-\[[^\]]*focus/.test(t) && !/outline-(?:none|0)/.test(t))
      if (focusable && removes && !tokens.some((t) => FOCUS_STYLE.test(t)) && !wrapped) report("a11y/focus-outline-removed", el.opening, `<${name}> removes the focus outline and adds no focus style.`)
    }

    // a11y/input-label
    if (on("a11y/input-label")) {
      const type = attrString(ts, el.attrs.get("type"))
      const isField = (el.isHost && (name === "input" || name === "textarea" || name === "select")) || ((name === "Input" || name === "Textarea") && /(^|\/)(ui|ballmac)(\/|$)/.test(imports.get(name) ?? ""))
      if (isField && !el.spread && !hiddenFromAssistive(el) && !["hidden", "submit", "button", "reset", "image"].includes(type ?? "")) {
        const named = el.attrs.has("aria-label") || el.attrs.has("aria-labelledby") || el.attrs.has("title") || hasAncestor(el, FORM_WRAPPERS) || (el.attrs.has("id") && /\bhtmlFor\s*=|\bfor\s*=/.test(text))
        if (!named) report("a11y/input-label", el.opening, `<${name}> has no label (no aria-label, no wrapping <label>, no matching htmlFor).`)
      }
    }

    // a11y/positive-tabindex
    if (on("a11y/positive-tabindex")) {
      const n = attrNumber(ts, el.attrs.get("tabIndex"))
      if (n !== undefined && n > 0) report("a11y/positive-tabindex", el.opening, `tabIndex={${n}} on <${name}> takes it out of the natural tab order.`)
    }

    // a11y/hand-rolled-dialog
    if (on("a11y/hand-rolled-dialog") && tokens.includes("fixed") && tokens.includes("inset-0")) {
      const z = tokens.some((t) => /^z-(?:\[?\d+\]?)$/.test(baseOf(t)) && Number(baseOf(t).replace(/\D/g, "")) >= 40)
      const scrim = tokens.some((t) => /^bg-(?:black|background|foreground)\/\d+$/.test(baseOf(t)) || baseOf(t).startsWith("backdrop-"))
      const decorative = tokens.some((t) => baseOf(t) === "pointer-events-none" || baseOf(t).startsWith("-z-"))
      const semantic = el.attrs.has("role") || el.attrs.has("aria-modal")
      const library = [...imports.values()].some((m) => DIALOG_LIB.test(m))
      if ((z || scrim) && !decorative && !semantic && !library) report("a11y/hand-rolled-dialog", el.opening, `<${name}> is a full-screen overlay built by hand (fixed inset-0).`)
    }

    // a11y/link-no-href
    if (on("a11y/link-no-href") && el.isHost && name === "a" && !el.attrs.has("href") && !el.attrs.has("role") && !el.spread) report("a11y/link-no-href", el.opening, "<a> has no href.")

    // tokens/hardcoded-color
    if (on("tokens/hardcoded-color")) {
      const hasDark = tokens.some((t) => variantOf(t).includes("dark:"))
      const fixed = tokens.filter((t) => NEUTRAL.test(baseOf(t)) || ARBITRARY_COLOR.test(baseOf(t)))
      const chromatic = tokens.filter((t) => CHROMATIC.test(baseOf(t)))
      const style = el.attrs.get("style")
      const inline = style?.initializer ? [...attrText(sf, style).matchAll(/(?:color|background(?:Color)?|borderColor|fill|stroke)\s*:\s*["'`](#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))["'`]/g)].map((m) => m[0]) : []
      if (fixed.length || inline.length) {
        const shown = [...fixed, ...inline.map((s) => `style ${s.replace(/\s+/g, " ")}`)]
        // Apps that make dark mode by hand (dark: classes next to the light ones) or do not use theme tokens get information, not a warning.
        const strict = ctx.tokensApp && !hasDark
        report("tokens/hardcoded-color", el.opening, `${short(shown)} ${shown.length === 1 ? "is a fixed colour" : "are fixed colours"} and will not follow the theme${strict ? "" : " (this element sets dark: styles itself, or the app does not use theme tokens)"}.`, strict ? undefined : { severity: "info" })
      } else if (chromatic.length) {
        // Status colours (red for errors, green for success) are often intentional, so they are mentioned but never fail a run.
        report("tokens/hardcoded-color", el.opening, `${short(chromatic)} ${chromatic.length === 1 ? "is a palette colour" : "are palette colours"}; prefer a token such as text-destructive or bg-primary if it carries meaning.`, { severity: "info" })
      }
    }

    // motion/endless-decorative
    if (on("motion/endless-decorative")) {
      const guarded = tokens.some((t) => /^(?:[a-z0-9-]+:)*motion-reduce:animate-none$/.test(t))
      const unguarded = (t: string) => !variantOf(t).includes("motion-safe:") && !variantOf(t).includes("motion-reduce:")
      const moving = tokens.filter((t) => /^animate-(?:ping|bounce)$/.test(baseOf(t)) && unguarded(t))
      const arbitrary = tokens.filter((t) => /^animate-\[.*infinite.*\]$/.test(baseOf(t)) && unguarded(t))
      // Pulse only changes opacity, which is not a motion trigger, so it is a note (it is also how skeletons are drawn).
      const pulse = tokens.filter((t) => /^animate-pulse$/.test(baseOf(t)) && unguarded(t))
      if (!guarded) {
        if (moving.length || arbitrary.length) report("motion/endless-decorative", el.opening, `${short([...moving, ...arbitrary])} loops forever and has no motion-reduce:animate-none.`)
        else if (pulse.length) report("motion/endless-decorative", el.opening, `${pulse[0]} pulses forever; add motion-reduce:animate-none if it is not a loading placeholder.`, { severity: "info" })
      }
    }

    // layout/fixed-wide and layout/viewport-height
    if (on("layout/fixed-wide")) {
      const wide = tokens.filter((t) => !variantOf(t) && /^(?:min-)?w-\[(\d+)px\]$/.test(t) && Number(/\[(\d+)px\]/.exec(t)![1]) >= 400)
      // Inside a scrolling or clipping container a wide element is intended (a table in overflow-x-auto) and does not widen the page.
      const capped = tokens.some((t) => baseOf(t).startsWith("max-w-")) || ancestorTokens(ts, el).some((t) => SCROLLER.test(baseOf(t)))
      const style = el.attrs.get("style")
      const styled = style?.initializer ? [...attrText(sf, style).matchAll(/\b(?:min)?[wW]idth\s*:\s*(\d{3,4})\b(?!\s*%)/g)].filter((m) => Number(m[1]) >= 400) : []
      if ((wide.length || styled.length) && !capped) report("layout/fixed-wide", el.opening, `${wide.length ? wide[0] : `width: ${styled[0]![1]}`} is wider than a 390px phone and nothing caps it.`)
    }
    if (on("layout/viewport-height") && tokens.some((t) => /^(?:min-|max-)?h-screen$/.test(baseOf(t)))) report("layout/viewport-height", el.opening, `${tokens.find((t) => /h-screen$/.test(baseOf(t)))} uses 100vh, which is taller than the visible area on phones.`)

    // rtl/physical-direction (off unless enabled)
    if (on("rtl/physical-direction")) {
      const found: string[] = []
      for (const t of tokens) {
        const b = baseOf(t)
        for (const [re, to] of PHYSICAL) {
          const m = b.match(re)
          if (m) {
            found.push(`${t} → ${variantOf(t)}${to(m)}`)
            break
          }
        }
      }
      if (found.length) report("rtl/physical-direction", el.opening, `${short(found, 3)} will not mirror in right-to-left languages.`)
    }
  }

  // motion/endless-decorative: Motion loops
  if (on("motion/endless-decorative") && /repeat\s*:\s*Infinity/.test(text) && !/useReducedMotion|useLoopsPaused|prefers-reduced-motion|reducedMotion|useReducedMotionSafe/.test(text)) {
    const at = /repeat\s*:\s*Infinity/.exec(text)!
    const { line, character } = sf.getLineAndCharacterOfPosition(at.index)
    report("motion/endless-decorative", { line: line + 1, column: character + 1 }, "repeat: Infinity loops forever, and nothing in this file listens to reduced motion.")
  }
}
