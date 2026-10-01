// Ballmac UI: Highlight. https://ui.ballmac.com/components/highlight
// A tiny, dependency-free tokenizer for the snippets developer components show: JSON, shell and curl, JS/TS, Python, Go, HTTP and .env.

export type TokenType = "plain" | "comment" | "string" | "number" | "keyword" | "property" | "function" | "flag" | "punctuation" | "literal"

export type Token = { type: TokenType; text: string }

export type HighlightLanguage = "json" | "bash" | "javascript" | "typescript" | "python" | "go" | "http" | "env" | "text"

/**
 * Tailwind classes per token type. Each color is a chart token mixed into the foreground,
 * so contrast holds on light and dark surfaces and the palette follows the theme.
 */
export const tokenClass: Record<TokenType, string> = {
  plain: "",
  comment: "text-muted-foreground italic",
  string: "text-[color-mix(in_oklab,var(--chart-2)_60%,var(--foreground))]",
  number: "text-[color-mix(in_oklab,var(--chart-3)_58%,var(--foreground))]",
  keyword: "text-[color-mix(in_oklab,var(--chart-4)_62%,var(--foreground))] font-medium",
  property: "text-[color-mix(in_oklab,var(--chart-1)_62%,var(--foreground))]",
  function: "text-[color-mix(in_oklab,var(--chart-5)_58%,var(--foreground))]",
  flag: "text-[color-mix(in_oklab,var(--chart-5)_58%,var(--foreground))]",
  punctuation: "text-muted-foreground",
  literal: "text-[color-mix(in_oklab,var(--chart-3)_58%,var(--foreground))] font-medium",
}

const JS_KEYWORDS =
  "const let var function return if else for while do switch case break continue new class extends import from export default async await try catch finally throw typeof instanceof of in as interface type enum implements public private readonly void"
const PY_KEYWORDS =
  "def return if elif else for while in not and or is import from as class try except finally raise with lambda pass yield async await global del assert"
const GO_KEYWORDS =
  "package import func return if else for range switch case default break continue go defer select chan map struct interface type var const"
const BASH_KEYWORDS = "if then else fi for do done while case esac function in export"
const LITERALS = "true false null undefined None True False nil NaN"

const set = (words: string) => new RegExp(`^(?:${words.trim().split(/\s+/).join("|")})$`)

type Rule = [TokenType, RegExp]

const common = {
  json: [
    ["property", /"(?:\\.|[^"\\\n])*"(?=\s*:)/y],
    ["string", /"(?:\\.|[^"\\\n])*"/y],
    ["number", /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/y],
    ["literal", /\b(?:true|false|null)\b/y],
    ["punctuation", /[{}[\],:]/y],
  ],
} as const

/** Splits `code` into tokens. Words are classified afterwards so keywords, literals and calls can be told apart. */
export function tokenize(code: string, language: HighlightLanguage = "text"): Token[] {
  if (language === "text") return [{ type: "plain", text: code }]
  const out: Token[] = []
  const push = (type: TokenType, text: string) => {
    const last = out[out.length - 1]
    if (last && last.type === type && type !== "plain") last.text += text
    else out.push({ type, text })
  }

  if (language === "json") {
    scan(code, common.json as unknown as Rule[], push)
    return out
  }

  if (language === "env") {
    for (const line of code.split("\n")) {
      const m = line.match(/^(\s*(?:export\s+)?)([A-Za-z_][A-Za-z0-9_]*)(=)(.*)$/)
      if (/^\s*#/.test(line)) push("comment", line + "\n")
      else if (m) {
        push("plain", m[1]!)
        push("property", m[2]!)
        push("punctuation", m[3]!)
        push(/^["'].*["']$/.test(m[4]!.trim()) ? "string" : "plain", m[4]! + "\n")
      } else push("plain", line + "\n")
    }
    const last = out[out.length - 1]
    if (last && !code.endsWith("\n")) last.text = last.text.replace(/\n$/, "")
    return out
  }

  if (language === "http") {
    code.split("\n").forEach((line, i, all) => {
      const nl = i < all.length - 1 ? "\n" : ""
      let m: RegExpMatchArray | null
      if ((m = line.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(\s+)(\S+)(.*)$/))) {
        push("keyword", m[1]!)
        push("plain", m[2]!)
        push("function", m[3]!)
        push("punctuation", m[4]! + nl)
      } else if ((m = line.match(/^(HTTP\/[\d.]+)(\s+)(\d{3})(.*)$/))) {
        push("punctuation", m[1]!)
        push("plain", m[2]!)
        push("number", m[3]!)
        push("plain", m[4]! + nl)
      } else if ((m = line.match(/^([\w-]+)(:)(.*)$/))) {
        push("property", m[1]!)
        push("punctuation", m[2]!)
        push("string", m[3]! + nl)
      } else push("plain", line + nl)
    })
    return out
  }

  const words =
    language === "python" ? set(PY_KEYWORDS) : language === "go" ? set(GO_KEYWORDS) : language === "bash" ? set(BASH_KEYWORDS) : set(JS_KEYWORDS)
  const literals = set(LITERALS)

  const rules: Rule[] =
    language === "bash"
      ? [
          ["comment", /(?:^|(?<=\s))#[^\n]*/y],
          ["string", /"(?:\\[\s\S]|[^"\\])*"|'[^']*'/y],
          ["flag", /(?<=^|\s)--?[A-Za-z][\w-]*/y],
          ["property", /\$\{?[A-Za-z_]\w*\}?/y],
          ["number", /\b\d+(?:\.\d+)?\b/y],
          ["plain", /\s+/y],
          ["string", /https?:\/\/[^\s"'\\]+/y],
          ["plain", /[A-Za-z_][\w./-]*/y],
          ["punctuation", /[|&;<>()=\\]+/y],
        ]
      : language === "python"
        ? [
            ["comment", /#[^\n]*/y],
            ["string", /"""[\s\S]*?"""|'''[\s\S]*?'''|[rbf]?"(?:\\.|[^"\\\n])*"|[rbf]?'(?:\\.|[^'\\\n])*'/y],
            ["number", /\b\d[\d_]*(?:\.\d+)?\b/y],
            ["plain", /\s+/y],
            ["plain", /[A-Za-z_]\w*/y],
            ["punctuation", /[{}()[\],.:=+\-*/%<>!&|@]+/y],
          ]
        : [
            ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
            ["string", /`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y],
            ["number", /\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b/y],
            ["plain", /\s+/y],
            ["plain", /[A-Za-z_$][\w$]*/y],
            ["punctuation", /[{}()[\];,.:<>=+\-*/%&|!?]+/y],
          ]

  scan(code, rules, (type, text) => {
    if (type !== "plain" || !/^[A-Za-z_$]/.test(text)) return push(type, text)
    if (words.test(text)) return push("keyword", text)
    if (literals.test(text)) return push("literal", text)
    return push("plain", text)
  })

  if (language === "bash") {
    // The first word of each command is the program name; a trailing backslash continues the command.
    let atStart = true
    let continued = false
    for (const t of out) {
      if (t.type === "plain" && !t.text.trim()) {
        if (t.text.includes("\n") && !continued) atStart = true
        continue
      }
      continued = t.type === "punctuation" && t.text.endsWith("\\")
      if (atStart && t.type === "plain" && /^[A-Za-z_]/.test(t.text)) t.type = "function"
      atStart = t.type === "punctuation" && /[|&;]/.test(t.text)
    }
  } else {
    // Identifiers directly followed by "(" are calls.
    for (let i = 0; i < out.length - 1; i++) {
      const t = out[i]!
      if (t.type === "plain" && /^[A-Za-z_$][\w$]*$/.test(t.text) && out[i + 1]!.text.startsWith("(")) t.type = "function"
    }
  }
  return out
}

function scan(code: string, rules: Rule[], push: (type: TokenType, text: string) => void) {
  let i = 0
  while (i < code.length) {
    let matched = false
    for (const [type, re] of rules) {
      re.lastIndex = i
      const m = re.exec(code)
      if (m && m.index === i && m[0].length > 0) {
        push(type, m[0])
        i += m[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      push("plain", code[i]!)
      i++
    }
  }
}

/** Tokenizes `code` and groups the tokens by line, ready to render one row at a time. */
export function highlightLines(code: string, language: HighlightLanguage = "text"): Token[][] {
  const lines: Token[][] = [[]]
  for (const token of tokenize(code, language)) {
    const parts = token.text.split("\n")
    parts.forEach((part, index) => {
      if (index > 0) lines.push([])
      if (part) lines[lines.length - 1]!.push({ type: token.type, text: part })
    })
  }
  return lines
}

/** Maps a file name or label such as "app.ts", "curl" or "Python" to a highlight language. */
export function languageFromName(name: string): HighlightLanguage {
  const n = name.toLowerCase()
  if (/\.(json|jsonc)$/.test(n) || n === "json") return "json"
  if (/\.(ts|tsx|mts|cts)$/.test(n) || n === "typescript" || n === "ts") return "typescript"
  if (/\.(js|jsx|mjs|cjs)$/.test(n) || /^(javascript|js|node|node\.js)$/.test(n)) return "javascript"
  if (/\.py$/.test(n) || n === "python") return "python"
  if (/\.go$/.test(n) || n === "go") return "go"
  if (/\.(sh|bash|zsh)$/.test(n) || /^(bash|shell|sh|curl|zsh|cli)$/.test(n)) return "bash"
  if (/(^|\.)env(\..*)?$/.test(n)) return "env"
  if (n === "http") return "http"
  return "text"
}
