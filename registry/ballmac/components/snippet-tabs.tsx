// Ballmac UI: Snippet Tabs. https://ui.ballmac.com/components/snippet-tabs
"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { CopyButton } from "@/components/ballmac/copy-button"
import { highlightLines, languageFromName, tokenClass, type HighlightLanguage } from "@/lib/ballmac/highlight"
import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type Snippet = {
  /** Tab text, such as "cURL" or "Python". Also picks the highlighter unless `language` is set. */
  label: string
  /** The code. `{{name}}` placeholders are replaced from the `variables` prop. */
  code: string
  /** Highlighter to use. Defaults to a guess from `label`. */
  language?: HighlightLanguage
}

const memory = new Map<string, string>()
const listeners = new Map<string, Set<() => void>>()

function readStored(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStored(key: string, value: string) {
  memory.set(key, value)
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage is blocked; the in-memory value still syncs this page.
  }
  listeners.get(key)?.forEach((notify) => notify())
}

function subscribeStored(key: string, notify: () => void) {
  let set = listeners.get(key)
  if (!set) listeners.set(key, (set = new Set()))
  set.add(notify)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return
    if (event.newValue === null) memory.delete(key)
    else memory.set(key, event.newValue)
    notify()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    set.delete(notify)
    window.removeEventListener("storage", onStorage)
  }
}

function useStoredLabel(key: string | undefined) {
  const subscribe = React.useCallback((notify: () => void) => (key ? subscribeStored(key, notify) : () => {}), [key])
  return React.useSyncExternalStore(
    subscribe,
    () => (key ? readStored(key) : null),
    // Server and hydration never see storage, so markup always matches.
    () => null
  )
}

function fill(code: string, variables?: Record<string, string>) {
  if (!variables) return code
  return code.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, name: string) => variables[name] ?? match)
}

type SnippetTabsProps = Omit<React.ComponentProps<"div">, "defaultValue" | "dir" | "title"> & {
  /** One tab per language. */
  snippets: Snippet[]
  /** Heading on the left of the tab bar, such as "Create a customer". */
  title?: string
  /** Label of the tab open at first. */
  defaultValue?: string
  /** Controlled open tab (a label). */
  value?: string
  /** Called with the label of the newly selected tab. */
  onValueChange?: (label: string) => void
  /** Remember the reader's language in localStorage under this key. Every instance sharing the key switches together. */
  storageKey?: string
  /** Values for `{{name}}` placeholders in the code, for example the viewer's API key. */
  variables?: Record<string, string>
  /** Show line numbers. */
  lineNumbers?: boolean
  /** Classes for the scrolling code area, for example a max height. */
  bodyClassName?: string
}

function SnippetTabs({
  snippets,
  title,
  defaultValue,
  value: valueProp,
  onValueChange,
  storageKey,
  variables,
  lineNumbers = false,
  bodyClassName,
  className,
  ...props
}: SnippetTabsProps) {
  const msg = useMessages()
  const labels = snippets.map((s) => s.label)
  const stored = useStoredLabel(storageKey)
  const [internal, setInternal] = React.useState(defaultValue ?? labels[0] ?? "")
  const preferred = stored && labels.includes(stored) ? stored : null
  const value = valueProp ?? preferred ?? internal
  const titleId = React.useId()

  function select(next: string) {
    setInternal(next)
    if (storageKey) writeStored(storageKey, next)
    onValueChange?.(next)
  }

  return (
    <TabsPrimitive.Root
      data-slot="snippet-tabs"
      value={value}
      onValueChange={select}
      className={cn("w-full overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <div className="flex min-h-11 items-center gap-2 border-b bg-muted/40 pe-1.5 ps-1.5">
        {title && (
          <span id={titleId} className="hidden shrink-0 ps-2 text-[13px] font-medium text-foreground sm:block">
            {title}
          </span>
        )}
        <TabsPrimitive.List
          aria-label={title ?? msg("snippet-tabs.language", "Language")}
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto py-1 [scrollbar-width:none] sm:justify-end [&::-webkit-scrollbar]:hidden"
        >
          {snippets.map((s) => (
            <TabsPrimitive.Trigger
              key={s.label}
              value={s.label}
              className="relative h-7 shrink-0 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs motion-reduce:transition-none"
            >
              {s.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        <CopyButton
          size="sm"
          ariaLabel="Copy snippet"
          getValue={() => fill(snippets.find((s) => s.label === value)?.code ?? "", variables)}
        />
      </div>
      {snippets.map((s) => {
        const text = fill(s.code, variables)
        const lines = highlightLines(text, s.language ?? languageFromName(s.label))
        return (
          <TabsPrimitive.Content
            key={s.label}
            value={s.label}
            tabIndex={-1}
            className="outline-none data-[state=inactive]:hidden"
          >
            <pre dir="ltr"
              role="region"
              aria-label={msg("snippet-tabs.code", "{label} code", { label: s.label })}
              tabIndex={0}
              className={cn(
                "overflow-auto p-4 font-mono text-[13px] leading-6 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50",
                bodyClassName
              )}
            >
              <code className="grid">
                {lines.map((line, i) => (
                  <span key={i} className="flex min-w-max">
                    {lineNumbers && (
                      <span aria-hidden="true" className="me-4 w-5 shrink-0 text-end text-muted-foreground tabular-nums select-none">
                        {i + 1}
                      </span>
                    )}
                    <span className="whitespace-pre">
                      {line.length === 0
                        ? " "
                        : line.map((t, j) => (
                            <span key={j} className={tokenClass[t.type]}>
                              {t.text}
                            </span>
                          ))}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
          </TabsPrimitive.Content>
        )
      })}
    </TabsPrimitive.Root>
  )
}

export { SnippetTabs, type SnippetTabsProps, type Snippet }
