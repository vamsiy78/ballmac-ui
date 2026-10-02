// Ballmac UI: Env Editor. https://ui.ballmac.com/components/env-editor
"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { AlertCircle, Eye, EyeOff, Plus, Trash2, ClipboardPaste } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type EnvVariable = {
  /** Stable id for the row. */
  id: string
  /** Variable name, such as DATABASE_URL. */
  key: string
  /** Its value. */
  value: string
}

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

/** Reads `KEY=value` lines, skipping blanks and `#` comments, handling `export`, quotes and inline comments after quoted values. */
function parseEnv(text: string): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(.*)$/)
    if (!m) continue
    let value = m[2]!.trim()
    const quote = value[0]
    if ((quote === '"' || quote === "'") && value.lastIndexOf(quote) > 0) {
      value = value.slice(1, value.lastIndexOf(quote))
      if (quote === '"') value = value.replace(/\\n/g, "\n").replace(/\\"/g, '"')
    } else {
      value = value.replace(/\s+#.*$/, "")
    }
    out.push({ key: m[1]!, value })
  }
  return out
}

/** Writes variables as a .env file, quoting values that need it. */
function formatEnv(variables: { key: string; value: string }[]) {
  return variables
    .filter((v) => v.key.trim())
    .map((v) => {
      const needsQuotes = /[\s#"'\\]/.test(v.value) || v.value === ""
      const value = needsQuotes ? `"${v.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"` : v.value
      return `${v.key}=${value}`
    })
    .join("\n")
}

function problemFor(variable: EnvVariable, all: EnvVariable[]) {
  if (!variable.key && !variable.value) return null
  if (!variable.key) return "Add a name for this value."
  if (!KEY_PATTERN.test(variable.key)) return "Use letters, numbers and underscores, and don't start with a number."
  if (all.filter((v) => v.key === variable.key).length > 1) return "This name is used more than once."
  return null
}

type EnvEditorProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  /** Variables (controlled). */
  value?: EnvVariable[]
  /** Initial variables when uncontrolled. */
  defaultValue?: Omit<EnvVariable, "id">[]
  /** Called with the new list after every change. */
  onChange?: (variables: EnvVariable[]) => void
  /** Names whose values are shown masked until revealed. Defaults to every row. */
  maskAll?: boolean
  /** Title shown above the rows. */
  title?: string
  /** Helper text under the title. */
  description?: string
  /** Disables editing, for read-only views. */
  disabled?: boolean
}

function EnvEditor({
  value: valueProp,
  defaultValue = [],
  onChange,
  maskAll = true,
  title,
  description,
  disabled = false,
  className,
  ...props
}: EnvEditorProps) {
  const msg = useMessages()
  title ??= msg("env-editor.title", "Environment variables")
  const reduce = useReducedMotion()
  const uid = React.useId()
  const counter = React.useRef(0)
  const nextId = React.useCallback(() => `${uid}-${counter.current++}`, [uid])
  const [internal, setInternal] = React.useState<EnvVariable[]>(() => defaultValue.map((v) => ({ ...v, id: `${uid}-${counter.current++}` })))
  const variables = valueProp ?? internal
  const [revealed, setRevealed] = React.useState<Set<string>>(new Set())
  const [pasteOpen, setPasteOpen] = React.useState(false)
  const [pasteText, setPasteText] = React.useState("")
  const [announce, setAnnounce] = React.useState("")
  const focusId = React.useRef<string | null>(null)
  const addRef = React.useRef<HTMLButtonElement>(null)

  function commit(next: EnvVariable[]) {
    if (valueProp === undefined) setInternal(next)
    onChange?.(next)
  }

  React.useEffect(() => {
    if (!focusId.current) return
    document.getElementById(`${focusId.current}-key`)?.focus()
    focusId.current = null
  })

  function update(id: string, patch: Partial<EnvVariable>) {
    commit(variables.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  function add() {
    const id = nextId()
    focusId.current = id
    commit([...variables, { id, key: "", value: "" }])
    setAnnounce(`Added variable ${variables.length + 1}`)
  }

  function remove(variable: EnvVariable, index: number) {
    commit(variables.filter((v) => v.id !== variable.id))
    setAnnounce(`Removed ${variable.key || `variable ${index + 1}`}`)
    const prev = variables[index - 1]
    if (prev) focusId.current = prev.id
    else addRef.current?.focus()
  }

  function importText(text: string, base: EnvVariable[] = variables) {
    const parsed = parseEnv(text)
    if (parsed.length === 0) return 0
    const merged = [...base.filter((v) => v.key || v.value)]
    for (const p of parsed) {
      const at = merged.findIndex((v) => v.key === p.key)
      if (at >= 0) merged[at] = { ...merged[at]!, value: p.value }
      else merged.push({ id: nextId(), ...p })
    }
    commit(merged)
    setAnnounce(`Imported ${parsed.length} ${parsed.length === 1 ? "variable" : "variables"}`)
    return parsed.length
  }

  const allRevealed = variables.length > 0 && variables.every((v) => revealed.has(v.id))
  const problems = variables.map((v) => problemFor(v, variables))
  const bad = problems.filter(Boolean).length

  return (
    <div
      data-slot="env-editor"
      dir="ltr"
      className={cn("@container w-full overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {description ?? msg("env-editor.variableCount", { one: "{count} variable", other: "{count} variables" }, { count: variables.length })}
            {bad > 0 && <span className="text-foreground"> · {msg("env-editor.toFix", "{count} to fix", { count: bad })}</span>}
          </p>
        </div>
        <button
          type="button"
          disabled={variables.length === 0}
          onClick={() => setRevealed(allRevealed ? new Set() : new Set(variables.map((v) => v.id)))}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          {allRevealed ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          {allRevealed ? "Hide all" : "Show all"}
        </button>
        <CopyButton
          variant="outline"
          label="Copy .env"
          ariaLabel="Copy as .env file"
          copiedLabel="Copied"
          getValue={() => formatEnv(variables)}
          disabled={variables.length === 0}
        />
      </div>

      {variables.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium text-foreground">{msg("env-editor.noVariablesYet", "No variables yet")}</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted-foreground">
            Add one by hand, or paste the contents of a .env file to import them all at once.
          </p>
        </div>
      ) : (
        <ul>
          <AnimatePresence initial={false}>
            {variables.map((v, i) => {
              const problem = problems[i]
              const shown = !maskAll || revealed.has(v.id)
              const errId = `${v.id}-err`
              return (
                <motion.li
                  key={v.id}
                  layout={reduce ? false : "position"}
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden border-b last:border-b-0"
                >
                  <div className="grid gap-2 px-4 py-2.5 @lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto] @lg:items-start">
                    <input
                      id={`${v.id}-key`}
                      value={v.key}
                      disabled={disabled}
                      spellCheck={false}
                      autoCapitalize="characters"
                      autoComplete="off"
                      placeholder={msg("env-editor.key", "KEY")}
                      aria-label={msg("env-editor.nameOfVariable", "Name of variable {n}", { n: i + 1 })}
                      aria-invalid={problem ? true : undefined}
                      aria-describedby={problem ? errId : undefined}
                      onChange={(e) => update(v.id, { key: e.target.value })}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData("text")
                        if (!/[=\n]/.test(text)) return
                        if (parseEnv(text).length === 0) return
                        e.preventDefault()
                        importText(text, !v.key && !v.value ? variables.filter((x) => x.id !== v.id) : variables)
                      }}
                      className={cn(
                        "h-9 w-full rounded-md border bg-background px-2.5 font-mono text-[13px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60",
                        problem && "border-destructive focus-visible:ring-destructive/25"
                      )}
                    />
                    <div className="relative">
                      <input
                        value={v.value}
                        disabled={disabled}
                        type={shown ? "text" : "password"}
                        spellCheck={false}
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        placeholder={msg("env-editor.value", "value")}
                        aria-label={msg("env-editor.valueOf", "Value of {name}", { name: v.key || msg("env-editor.variableN", "variable {n}", { n: i + 1 }) })}
                        onChange={(e) => update(v.id, { value: e.target.value })}
                        className="h-9 w-full rounded-md border bg-background pe-9 ps-2.5 font-mono text-[13px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
                      />
                      {maskAll && (
                        <button
                          type="button"
                          aria-pressed={shown}
                          aria-label={shown ? msg("env-editor.hideValueOf", "Hide value of {name}", { name: v.key || msg("env-editor.variableN", "variable {n}", { n: i + 1 }) }) : msg("env-editor.showValueOf", "Show value of {name}", { name: v.key || msg("env-editor.variableN", "variable {n}", { n: i + 1 }) })}
                          onClick={() =>
                            setRevealed((set) => {
                              const next = new Set(set)
                              if (next.has(v.id)) next.delete(v.id)
                              else next.add(v.id)
                              return next
                            })
                          }
                          className="absolute top-1 end-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {shown ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={msg("env-editor.remove", "Remove {name}", { name: v.key || msg("env-editor.variableN", "variable {n}", { n: i + 1 }) })}
                      onClick={() => remove(v, i)}
                      className="inline-flex size-9 items-center justify-center justify-self-end rounded-md text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 @lg:justify-self-auto"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                  {problem && (
                    <p id={errId} className="flex items-center gap-1.5 px-4 pb-2.5 text-xs text-foreground">
                      <AlertCircle aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
                      {problem}
                    </p>
                  )}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}

      {pasteOpen && (
        <div className="border-t bg-muted/30 p-4">
          <label htmlFor={`${uid}-paste`} className="mb-1.5 block text-[13px] font-medium text-foreground">
            {msg("env-editor.pasteAEnvFile", "Paste a .env file")}
          </label>
          <textarea
            id={`${uid}-paste`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            spellCheck={false}
            placeholder={"DATABASE_URL=postgres://…\nAPI_KEY=…"} // i18n-ignore: sample .env text
            className="w-full resize-y rounded-md border bg-background p-2.5 font-mono text-[13px] outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setPasteOpen(false)
                setPasteText("")
              }}
              className="h-8 rounded-md px-3 text-[13px] font-medium text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {msg("env-editor.cancel", "Cancel")}
            </button>
            <button
              type="button"
              disabled={parseEnv(pasteText).length === 0}
              onClick={() => {
                importText(pasteText)
                setPasteOpen(false)
                setPasteText("")
              }}
              className="h-8 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
            >
              {msg("env-editor.import", "Import")} {parseEnv(pasteText).length || ""} {parseEnv(pasteText).length === 1 ? "variable" : "variables"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-4 py-3">
        <button
          ref={addRef}
          type="button"
          disabled={disabled}
          onClick={add}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[13px] font-medium shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus aria-hidden="true" className="size-4" />
          {msg("env-editor.addVariable", "Add variable")}
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={pasteOpen}
          onClick={() => setPasteOpen((o) => !o)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          <ClipboardPaste aria-hidden="true" className="size-4" />
          {msg("env-editor.pasteEnv", "Paste .env")}
        </button>
        <span className="ms-auto hidden text-xs text-muted-foreground @md:block">{msg("env-editor.tipPasteSeveralLinesInto", "Tip: paste several lines into any name field to import them.")}</span>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {announce}
      </span>
    </div>
  )

}

export { EnvEditor, parseEnv, formatEnv, type EnvEditorProps, type EnvVariable }
