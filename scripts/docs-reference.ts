/**
 * Writes the docs reference pages that come from code, so they cannot drift from it:
 *
 *   reference/cli.mdx               the help text of packages/cli
 *   reference/check-rules.mdx       packages/audit RULES
 *   reference/mcp-tools.mdx         what packages/mcp answers to tools/list, resources/list and prompts/list (the server is started and asked)
 *   reference/motion-settings.mdx   packages/theme-engine motion fields, ranges and feels (with the doc comments of its types)
 *   reference/platform-feels.mdx    packages/theme-engine FEELS
 *   reference/building-blocks.mdx   the props of the components the docs name (read from their TypeScript types) and the signatures of the helpers
 *   reference/block-states.mdx      the states every free block lists in its metadata
 *   reference/messages.mdx          every translatable message
 *   reference/rtl-fixed-items.mdx   items that keep a fixed layout in right-to-left, with the reason
 *
 *   pnpm docs:generate           write them
 *   pnpm docs:generate --check   fail when a committed page differs from what the code produces (runs in `pnpm check`)
 *
 * Messages, fixed-layout items and block states come from the registry build (`pnpm build:registry`), which has to run first.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"

import { Node, Project, SyntaxKind } from "ts-morph"

import { RULES } from "../packages/audit/src/rules/meta"
import { DEFAULT_MOTION, FEELS, MOTION_PERSONALITIES, MOTION_RANGES } from "../packages/theme-engine/src/index"

const ROOT = join(import.meta.dirname, "..")
const OUT = join(ROOT, "apps/www/content/docs/reference")
const GENERATED = join(ROOT, "apps/www/lib/generated")

type Page = { file: string; title: string; description: string; from: string; body: string }

// ---------- small helpers ----------

/** Escapes text for MDX outside code: braces and angle brackets would otherwise start JSX. Backtick spans are kept as code. */
function md(text: string): string {
  return text
    .split(/(`[^`]*`)/)
    .map((part, i) => (i % 2 ? part : part.replace(/[{}<]/g, (c) => `\\${c}`)))
    .join("")
}
const cell = (text: string) => md(text).replace(/\|/g, "\\|").replace(/\n/g, " ")
const code = (text: string) => (text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``)
/** A GFM table. A pipe inside a code span still ends the cell unless it is escaped. */
const tableCell = (c: string) => c.replace(/`[^`]*`/g, (span) => span.replace(/(?<!\\)\|/g, "\\|"))
const table = (head: string[], rows: string[][]) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map(tableCell).join(" | ")} |`)].join("\n")
const fence = (lang: string, body: string, meta = "") => `\`\`\`${lang}${meta ? ` ${meta}` : ""}\n${body.replace(/\s+$/, "")}\n\`\`\``
const readGenerated = <T>(name: string): T => {
  const file = join(GENERATED, name)
  if (!existsSync(file)) throw new Error(`apps/www/lib/generated/${name} is missing: run \`pnpm build:registry\` first`)
  return JSON.parse(readFileSync(file, "utf8")) as T
}

// ---------- CLI ----------

function cliPage(): Page {
  const source = readFileSync(join(ROOT, "packages/cli/src/index.ts"), "utf8")
  const help = source.match(/const HELP = `([\s\S]*?)`\n/)?.[1]
  if (!help) throw new Error("packages/cli/src/index.ts: could not find the HELP text")
  const registry = readFileSync(join(ROOT, "packages/cli/src/registry.ts"), "utf8").match(/DEFAULT_REGISTRY\s*=\s*"([^"]+)"/)?.[1]
  if (!registry) throw new Error("packages/cli/src/registry.ts: could not find DEFAULT_REGISTRY")
  const text = help.replace("${version}", "<version>").replace("${DEFAULT_REGISTRY}", registry)

  type Command = { usage: string; description: string[]; options: { flag: string; description: string }[] }
  const commands: Command[] = []
  const options: { flag: string; description: string }[] = []
  const env: { name: string; description: string }[] = []
  let section: "commands" | "options" | "environment" | "other" = "commands"
  let started = false
  for (const raw of text.split("\n")) {
    if (/^Usage:/.test(raw)) {
      started = true
      continue
    }
    if (!started) continue
    if (/^Options:/.test(raw)) (section = "options")
    else if (/^Environment:/.test(raw)) (section = "environment")
    else if (/^Docs:/.test(raw)) section = "other"
    else if (!raw.trim()) continue
    else if (section === "commands") {
      const deep = raw.match(/^ {8}(--\S.*?)\s{2,}(.+)$/)
      const cmd = raw.match(/^ {2}(\S.*?)\s{2,}(.+)$/)
      const more = raw.match(/^ {20,}(\S.*)$/)
      if (deep && commands.length) commands.at(-1)!.options.push({ flag: deep[1]!, description: deep[2]! })
      else if (more && commands.length) commands.at(-1)!.description.push(more[1]!)
      else if (cmd) commands.push({ usage: cmd[1]!, description: [cmd[2]!], options: [] })
    } else if (section === "options") {
      const m = raw.match(/^ {2}(\S.*?)\s{2,}(.+)$/)
      if (m) options.push({ flag: m[1]!, description: m[2]! })
    } else if (section === "environment") {
      const m = raw.match(/^ {2}(\S+)\s{2,}(.+)$/)
      if (m) env.push({ name: m[1]!, description: m[2]! })
    }
  }
  if (commands.length < 5 || options.length < 2 || env.length < 2) throw new Error("packages/cli/src/index.ts: the help text no longer parses; update scripts/docs-reference.ts")

  const idOf = (usage: string) => usage.split(" ").slice(0, usage.startsWith("test add") ? 2 : 1).join("-")
  const sections = commands.map((c) => {
    const id = idOf(c.usage)
    const flags = c.options.length ? `\n\n${table(["Option", "What it does"], c.options.map((o) => [code(o.flag), cell(o.description)]))}` : ""
    return `## ${code(`ballmac ${c.usage}`)} [#${id}]\n\n${md(c.description.join(" "))}${flags}`
  })
  const body = `Run \`ballmac\` through \`npx @ballmac/cli\`. This page lists every command and option the tool prints in \`ballmac --help\`.

\`\`\`npm
npx @ballmac/cli <command> [options]
\`\`\`

${sections.join("\n\n")}

## Global options [#global-options]

${table(["Option", "What it does"], options.map((o) => [code(o.flag), cell(o.description)]))}

## Environment variables [#environment]

${table(["Variable", "What it does"], env.map((e) => [code(e.name), cell(e.description)]))}

## Related

- [Update components without losing your edits](/docs/guides/update-components)
- [Check your own app](/docs/guides/check-your-app)
`
  return { file: "cli.mdx", title: "CLI commands", description: "Every ballmac command and option, generated from the CLI's own help text.", from: "packages/cli/src/index.ts", body }
}

// ---------- check rules ----------

const AREAS: [string, string][] = [
  ["states", "States"],
  ["a11y", "Accessibility"],
  ["tokens", "Tokens"],
  ["motion", "Motion"],
  ["layout", "Layout"],
  ["rtl", "Right to left"],
]
const LEVEL: Record<string, string> = { error: "Error", warn: "Warning", info: "Note", off: "Off by default" }

function rulesPage(): Page {
  const unknown = RULES.filter((r) => !AREAS.some(([a]) => a === r.area))
  if (unknown.length) throw new Error(`Rules in an area this page doesn't list: ${unknown.map((r) => r.id).join(", ")}`)
  const sections = AREAS.map(([area, label]) => {
    const list = RULES.filter((r) => r.area === area)
    if (!list.length) return ""
    const rules = list.map((r) => {
      const example = r.example ? `\n\nInstead of:\n\n${fence("tsx", r.example.bad)}\n\nWrite:\n\n${fence("tsx", r.example.good)}` : ""
      return `### ${r.id} [#${r.id.replace("/", "-")}]\n\n**${LEVEL[r.defaultLevel]}.** ${md(r.title)}\n\n${md(r.why)}\n\n**Fix:** ${md(r.fix)}${example}`
    })
    return `## ${label} [#${area}]\n\n${rules.join("\n\n")}`
  }).filter(Boolean)
  const body = `${RULES.length} rules. Each one says why it matters to the person using your app and how to fix it. To run them, see [Check your own app](/docs/guides/check-your-app). To change a rule's level, set it in \`.ballmacrc.json\`.

${sections.join("\n\n")}
`
  return { file: "check-rules.mdx", title: "Check rules", description: "Every rule ballmac check and the audit_project tool apply, with why it matters, how to fix it and an example.", from: "packages/audit/src/rules/meta.ts", body }
}

// ---------- MCP ----------

type JsonSchema = { type?: string | string[]; enum?: unknown[]; items?: JsonSchema; properties?: Record<string, JsonSchema>; required?: string[]; minimum?: number; maximum?: number; minLength?: number; description?: string; additionalProperties?: unknown }

function schemaType(s: JsonSchema): string {
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(" | ")
  if (s.type === "array") return `${schemaType(s.items ?? {})}[]`
  if (s.type === "object") return s.properties ? "object" : "record"
  return Array.isArray(s.type) ? s.type.join(" | ") : (s.type ?? "any")
}

async function listMcp() {
  // The server imports the audit engine from a generated copy that is git-ignored, so a fresh checkout (CI) has to make it first.
  const vendor = spawnSync("node", ["../audit/scripts/vendor.mjs", "src/vendor/audit"], { cwd: join(ROOT, "packages/mcp"), encoding: "utf8" })
  if (vendor.status !== 0) throw new Error(`Could not copy the audit engine into packages/mcp: ${vendor.stderr}`)
  const require = createRequire(join(ROOT, "packages/mcp/package.json"))
  const { Client } = await import(require.resolve("@modelcontextprotocol/sdk/client/index.js"))
  const { StdioClientTransport } = await import(require.resolve("@modelcontextprotocol/sdk/client/stdio.js"))
  const transport = new StdioClientTransport({ command: join(ROOT, "node_modules/.bin/tsx"), args: [join(ROOT, "packages/mcp/src/index.ts")], cwd: join(ROOT, "packages/mcp"), stderr: "ignore" })
  const client = new Client({ name: "ballmac-docs", version: "0.0.0" })
  const timeout = setTimeout(() => {
    throw new Error("The MCP server did not answer in 60 seconds")
  }, 60_000)
  try {
    await client.connect(transport)
    const tools = (await client.listTools()).tools as { name: string; title?: string; description?: string; inputSchema: JsonSchema; annotations?: { readOnlyHint?: boolean } }[]
    const prompts = (await client.listPrompts()).prompts as { name: string; title?: string; description?: string; arguments?: { name: string; description?: string; required?: boolean }[] }[]
    const resources = (await client.listResources()).resources as { uri: string; name: string; title?: string; description?: string }[]
    const templates = (await client.listResourceTemplates()).resourceTemplates as { uriTemplate: string; name: string; title?: string; description?: string }[]
    return { tools, prompts, resources, templates }
  } finally {
    clearTimeout(timeout)
    await client.close()
  }
}

async function mcpPage(): Promise<Page> {
  const { tools, prompts, resources, templates } = await listMcp()
  const mcpSource = readFileSync(join(ROOT, "packages/mcp/src/index.ts"), "utf8") + readFileSync(join(ROOT, "packages/mcp/src/catalog.ts"), "utf8")
  for (const v of ["BALLMAC_UI_URL", "BALLMAC_LICENSE_KEY"]) if (!mcpSource.includes(v)) throw new Error(`packages/mcp no longer reads ${v}; update scripts/docs-reference.ts`)
  const toolSections = tools.map((t) => {
    const props = Object.entries(t.inputSchema.properties ?? {})
    const required = new Set(t.inputSchema.required ?? [])
    const inputs = props.length
      ? `\n\n${table(
          ["Input", "Type", "Required"],
          props.map(([name, s]) => {
            const range = s.minimum !== undefined || s.maximum !== undefined ? ` (${s.minimum ?? ""} to ${s.maximum ?? ""})` : ""
            return [code(name), `${code(schemaType(s))}${range}`, required.has(name) ? "Yes" : "No"]
          })
        )}`
      : "\n\nTakes no input."
    return `### ${t.name} [#${t.name}]\n\n${md(t.description ?? t.title ?? "")}${inputs}`
  })
  const promptSections = prompts.map((p) => {
    const args = p.arguments?.length ? ` Arguments: ${p.arguments.map((a) => `${code(a.name)}${a.required ? "" : " (optional)"}`).join(", ")}.` : ""
    return `- ${code(p.name)}: ${md(p.description ?? p.title ?? "")}${args}`
  })
  const body = `\`@ballmac/mcp\` is read-only: it answers questions and returns install commands, and never writes files or runs commands. To connect it, see [Connect your AI agent](/docs/get-started/connect-your-agent).

## Tools [#tools]

${tools.length} tools.

${toolSections.join("\n\n")}

## Resources [#resources]

${[...resources.map((r) => `- ${code(r.uri)}: ${md(r.description ?? r.title ?? r.name)}`), ...templates.map((r) => `- ${code(r.uriTemplate)}: ${md(r.description ?? r.title ?? r.name)}`)].join("\n")}

## Prompts [#prompts]

${promptSections.join("\n")}

## Environment variables [#environment]

Both are environment variables of the server. Neither is needed for the free catalog.

${table(
  ["Variable", "What it does"],
  [
    [code("BALLMAC_UI_URL"), "The catalog to read. Default `https://ui.ballmac.com`. Set it to read a local copy of the site."],
    [code("BALLMAC_LICENSE_KEY"), "Your Ballmac UI Pro licence key. With it, `get_item` and `get_examples` also return the source of Pro items. The key is only sent to the Ballmac UI site."],
  ]
)}

\`npx @ballmac/mcp --help\` and \`--version\` work from a terminal.

## Pro items [#pro-items]

Pro items show up in search with \`tier: "pro"\` and install from the \`@ballmac-pro\` namespace. Without a key the agent still sees their description, props and install command, but not the source. See [Set up Ballmac UI Pro](/docs/guides/pro#use-pro-with-the-mcp-server).
`
  return { file: "mcp-tools.mdx", title: "MCP tools", description: "Every tool, resource and prompt of the @ballmac/mcp server, read from the running server.", from: "packages/mcp/src/index.ts", body }
}

// ---------- motion and feels ----------

/** The doc comment of each field of a TypeScript type, from the source, so the descriptions live with the code. */
function fieldDocs(file: string, typeName: string): Record<string, string> {
  const project = new Project({ useInMemoryFileSystem: false, skipAddingFilesFromTsConfig: true })
  const sf = project.addSourceFileAtPath(join(ROOT, file))
  const alias = sf.getTypeAliasOrThrow(typeName)
  const out: Record<string, string> = {}
  for (const m of alias.getDescendantsOfKind(SyntaxKind.PropertySignature)) out[m.getName()] = m.getJsDocs().map((d) => d.getDescription().trim()).join(" ")
  return out
}

function motionPage(): Page {
  const docs = fieldDocs("packages/theme-engine/src/motion.ts", "MotionFields")
  const keys = ["speed", "bounce", "travel", "hover", "stagger"] as const
  for (const k of [...keys, "ambient", "reduce"]) if (!docs[k]) throw new Error(`MotionFields.${k} has no doc comment; add one in packages/theme-engine/src/motion.ts`)
  for (const k of Object.keys(MOTION_RANGES)) if (!(keys as readonly string[]).includes(k)) throw new Error(`MOTION_RANGES.${k} is new: add it to scripts/docs-reference.ts`)
  const rows = [
    ...keys.map((k) => [code(`--bm-${k}`), `${MOTION_RANGES[k].min} to ${MOTION_RANGES[k].max}`, String(DEFAULT_MOTION[k]), cell(docs[k]!)]),
    [code("--bm-ambient"), "1 or 0", DEFAULT_MOTION.ambient ? "1" : "0", cell(docs.ambient!)],
  ]
  const personalities = MOTION_PERSONALITIES.map((p) => {
    const m = p.motion
    return `### ${p.title} [#${p.slug}]\n\n${md(p.description)} Install: ${code(`@ballmac/motion-${p.slug}`)}.\n\n${table(
      ["Speed", "Bounce", "Travel", "Hover", "Stagger", "Loops"],
      [[m.speed, m.bounce, m.travel, m.hover, m.stagger, m.ambient ? "On" : "Off"].map(String)]
    )}`
  })
  const body = `A theme sets how a product moves with six settings. Each is a CSS variable on \`:root\`. The defaults reproduce Ballmac UI exactly as it was, so adding the theme changes nothing until you change a setting. For what they do together, see [How motion works](/docs/concepts/motion).

## Settings [#settings]

${table(["Variable", "Range", "Default", "What it does"], rows)}

Reduced motion has its own setting, \`reduce\`: ${md(docs.reduce!)}

## Ready-made feels [#ready-made-feels]

Each is a registry theme that changes movement only and leaves your colors alone. Installing another replaces it.

\`\`\`npm
npx shadcn@latest add @ballmac/motion-calm
\`\`\`

${personalities.join("\n\n")}
`
  return { file: "motion-settings.mdx", title: "Motion settings", description: "The six motion settings with their variables, ranges and defaults, and the five ready-made motion feels.", from: "packages/theme-engine/src/motion.ts", body }
}

const px = (v: string) => (v.startsWith("calc(var(--spacing) * ") ? `${Number.parseFloat(v.slice(22)) * 4} px` : v.endsWith("rem") ? `${Number.parseFloat(v) * 16} px` : v)

function feelsPage(): Page {
  const rows = FEELS.map((f) => [
    `**${f.title}**<br />${cell(f.tagline)}`,
    px(f.tokens.control.h),
    `${Number((f.spec.radius * 16).toFixed(1))} px`,
    `${f.tokens.focus.width}, ${f.tokens.focus.alpha}`,
    f.controls === "left" ? "Left (traffic lights)" : f.controls === "right" ? "Right (caption buttons)" : "None",
  ])
  const list = FEELS.map((f) => `### ${f.title} [#${f.slug}]\n\n${md(f.description)} Install: ${code(`@ballmac/feel-${f.slug}`)}.`)
  const body = `A feel is everything about a product except its colors. This page lists what each of the four feels sets. For how they work and their limits, see [How platform feels work](/docs/concepts/platform-feels). To use one, see [Pick a platform feel](/docs/guides/platform-feels).

## What each feel sets [#what-each-feel-sets]

${table(["Feel", "Control height", "Corners", "Focus ring", "Window controls"], rows)}

## The four feels [#the-four-feels]

${list.join("\n\n")}
`
  return { file: "platform-feels.mdx", title: "Platform feels", description: "What the web, macOS, iOS and Windows feels set: control size, corners, focus ring and window controls.", from: "packages/theme-engine/src/feel.ts", body }
}

// ---------- building blocks: props and helper signatures ----------

type SiteItem = { name: string; title: string; type: string; exports: string[]; props: { component: string; props: { name: string; type: string; required: boolean; default?: string; description?: string }[] }[] }

/** Components whose props the docs refer to, and the helper modules whose exports the guides use. */
const COMPONENTS = ["state-view", "app-window", "media", "match-highlight", "cover-art"]
const HELPERS: { name: string; file: string; heading: string; about: string }[] = [
  { name: "use-resource", file: "registry/ballmac/lib/use-resource.ts", heading: "use-resource", about: "Turns a fetch into the state a block takes, and maps TanStack Query or SWR results onto it." },
  { name: "direction", file: "registry/ballmac/lib/direction.tsx", heading: "direction", about: "The text direction provider and hook for right-to-left." },
  { name: "i18n", file: "registry/ballmac/lib/i18n.tsx", heading: "i18n", about: "The translation provider and hooks." },
  { name: "feel", file: "registry/ballmac/lib/feel.ts", heading: "feel", about: "Read and set the platform feel." },
  { name: "return-focus", file: "registry/ballmac/lib/return-focus.ts", heading: "return-focus", about: "Puts keyboard focus back where it was when a dialog closes." },
  { name: "shortcut", file: "registry/ballmac/lib/shortcut.ts", heading: "shortcut", about: "Formats and records keyboard shortcuts in each platform's notation." },
]

function signatures(file: string) {
  const project = new Project({ skipAddingFilesFromTsConfig: true })
  const sf = project.addSourceFileAtPath(join(ROOT, file))
  const out: { name: string; kind: string; signature: string; doc: string }[] = []
  const doc = (n: Node) => (Node.isJSDocable(n) ? n.getJsDocs().map((d) => d.getDescription().trim()).join(" ") : "")
  for (const fn of sf.getFunctions()) {
    if (!fn.isExported()) continue
    const typeParams = fn.getTypeParameters().length ? `<${fn.getTypeParameters().map((t) => t.getText()).join(", ")}>` : ""
    const params = fn.getParameters().map((p) => p.getText().replace(/\s+/g, " ")).join(", ")
    const ret = fn.getReturnTypeNode()?.getText().replace(/\s+/g, " ")
    out.push({ name: fn.getName() ?? "default", kind: "function", signature: `${fn.getName()}${typeParams}(${params})${ret ? `: ${ret}` : ""}`, doc: doc(fn) })
  }
  for (const v of sf.getVariableStatements()) {
    if (!v.isExported()) continue
    for (const d of v.getDeclarations()) {
      const init = d.getInitializer()
      if (Node.isArrowFunction(init)) {
        const params = init.getParameters().map((p) => p.getText().replace(/\s+/g, " ")).join(", ")
        const ret = init.getReturnTypeNode()?.getText().replace(/\s+/g, " ")
        out.push({ name: d.getName(), kind: "function", signature: `${d.getName()}(${params})${ret ? `: ${ret}` : ""}`, doc: doc(v) })
      }
    }
  }
  for (const t of sf.getTypeAliases()) {
    if (!t.isExported()) continue
    out.push({ name: t.getName(), kind: "type", signature: `type ${t.getName()} = ${t.getTypeNodeOrThrow().getText().replace(/\s+/g, " ")}`, doc: doc(t) })
  }
  return out
}

function buildingBlocksPage(): Page {
  const items = readGenerated<SiteItem[] | { items: SiteItem[] }>("index.json")
  const all = Array.isArray(items) ? items : items.items
  const comps = COMPONENTS.map((name) => {
    const item = all.find((i) => i.name === name)
    if (!item) throw new Error(`building-blocks: no registry item named ${name}`)
    const tables = item.props
      .filter((p) => p.props.length)
      .map((c) => {
        const rows = c.props.map((p) => [`${code(p.name)}${p.required ? " (required)" : ""}`, code(p.type.length > 80 ? `${p.type.slice(0, 77)}...` : p.type), p.default ? code(p.default) : "", cell(p.description ?? "")])
        return `#### ${code(`<${c.component}>`)} [#${c.component.toLowerCase()}-props]\n\n${table(["Prop", "Type", "Default", "Description"], rows)}`
      })
    return `### ${item.title} [#${name}]\n\nInstall: ${code(`@ballmac/${name}`)}. Page: [${item.title}](/components/${name}).\n\n${tables.join("\n\n")}\n\nAlso accepts the standard attributes of its root element.`
  })
  const helpers = HELPERS.map((h) => {
    const list = signatures(h.file)
    if (!list.length) throw new Error(`building-blocks: ${h.file} exports nothing`)
    const rows = list.map((s) => `${fence("ts", s.signature)}\n${s.doc ? `\n${md(s.doc)}\n` : ""}`)
    return `### ${h.heading} [#${h.name}]\n\n${md(h.about)} Install: ${code(`@ballmac/${h.name}`)}.\n\n${rows.join("\n")}`
  })
  const body = `The components and helpers the guides refer to, with their props and signatures read from their TypeScript types. The page of every component and block lists its own props too.

## Components [#components]

${comps.join("\n\n")}

## Helpers [#helpers]

${helpers.join("\n\n")}
`
  return { file: "building-blocks.mdx", title: "Building blocks", description: "Props of StateView, AppWindow, Media and the other building blocks, and the signatures of the hooks and helpers, read from their TypeScript types.", from: "registry/ballmac", body }
}

// ---------- block states, messages, fixed-layout items ----------

function blockStatesPage(): Page {
  const raw = readGenerated<(SiteItem & { tier: string; states: { id: string }[] })[] | { items: (SiteItem & { tier: string; states: { id: string }[] })[] }>("index.json")
  const all = Array.isArray(raw) ? raw : raw.items
  const blocks = all.filter((i) => i.type === "registry:block" && i.tier === "free").sort((a, b) => a.name.localeCompare(b.name))
  const withStates = blocks.filter((b) => b.states.length)
  const body = `${withStates.length} of the ${blocks.length} free blocks show states. The rest are static content with nothing to load, submit or fail, and say so on their page. For what the states mean, see [Why every block has states](/docs/concepts/states). To drive them, see [Handle loading, empty and error states](/docs/guides/states).

${withStates.map((b) => `- [${b.title}](/blocks/${b.name}): ${b.states.map((s) => s.id).join(", ")}`).join("\n")}

A build check keeps this true: a free block that lists no states and gives no reason fails \`pnpm check\`.
`
  return { file: "block-states.mdx", title: "Block states", description: "Which free blocks show loading, empty, error, submitting and success states.", from: "registry.json", body }
}

function messagesPage(): Page {
  const messages = readGenerated<Record<string, string>>("messages.json")
  const keys = Object.keys(messages).sort()
  const body = `Every built-in label, placeholder and screen reader text is a message with an English default: ${keys.length} in all. To translate them, see [Translate Ballmac UI](/docs/guides/translate). The same keys are available as JSON at [/i18n/en.json](/i18n/en.json).

${table(["Key", "English"], keys.map((k) => [code(k), cell(messages[k]!)]))}
`
  return { file: "messages.mdx", title: "Messages", description: "Every translatable message in Ballmac UI, with its key and English text.", from: "registry/ballmac", body }
}

function rtlFixedPage(): Page {
  const fixed = readGenerated<{ name: string; title: string; reason: string }[]>("rtl-exceptions.json")
  const body = `These items keep a fixed layout in right-to-left on purpose. For what mirrors and what doesn't, see [What mirrors in right-to-left](/docs/concepts/right-to-left).

${[...fixed].sort((a, b) => a.name.localeCompare(b.name)).map((f) => `- [${f.title}](/components/${f.name}): ${md(f.reason)}`).join("\n")}
`
  return { file: "rtl-fixed-items.mdx", title: "Fixed-layout items", description: "The items that keep a fixed layout in right-to-left, with the reason for each.", from: "scripts/rtl-exceptions.json", body }
}

// ---------- write or check ----------

const render = (p: Page) => `---\ntitle: ${JSON.stringify(p.title)}\ndescription: ${JSON.stringify(p.description)}\ngeneratedFrom: ${p.from}\n---\n\n${p.body}`

export async function generate(): Promise<Map<string, string>> {
  const pages = [cliPage(), rulesPage(), await mcpPage(), motionPage(), feelsPage(), buildingBlocksPage(), blockStatesPage(), messagesPage(), rtlFixedPage()]
  return new Map(pages.map((p) => [p.file, render(p)]))
}

const pages = await generate()
if (process.argv.includes("--check")) {
  const problems: string[] = []
  for (const [file, text] of pages) {
    const path = join(OUT, file)
    if (!existsSync(path)) problems.push(`${file} is missing`)
    else if (readFileSync(path, "utf8") !== text) problems.push(`${file} is out of date`)
  }
  for (const f of existsSync(OUT) ? readdirSync(OUT) : []) {
    if (f.endsWith(".mdx") && !pages.has(f) && /^generatedFrom:/m.test(readFileSync(join(OUT, f), "utf8"))) problems.push(`${f} is generated but no longer produced`)
  }
  if (problems.length) {
    console.error(`Generated docs are out of date:\n  ${problems.join("\n  ")}\nRun \`pnpm docs:generate\` and commit the result.`)
    process.exit(1)
  }
  console.log(`✓ ${pages.size} generated docs pages match the code`)
} else {
  mkdirSync(OUT, { recursive: true })
  for (const [file, text] of pages) writeFileSync(join(OUT, file), text)
  console.log(`✓ ${pages.size} docs reference pages written to apps/www/content/docs/reference/`)
}
