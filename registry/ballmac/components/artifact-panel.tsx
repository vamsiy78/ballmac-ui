// Ballmac UI: Artifact Panel. https://ui.ballmac.com/components/artifact-panel
"use client"

import * as React from "react"
import { Check, ChevronLeft, ChevronRight, Copy, Download, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type ArtifactPanelProps = Omit<React.ComponentProps<"section">, "title" | "onChange"> & {
  /** Name of the generated thing, such as "Pricing table". */
  title: string
  /** Kind of artifact, shown under the title, such as "React component". */
  kind?: string
  /** Icon in the header tile. */
  icon?: React.ReactNode
  /** Source text. Shown in the Code tab and used for Copy and Download. */
  code?: string
  /** File name for Download and the code header, such as "pricing-table.tsx". */
  filename?: string
  /** Language label for the code, such as "tsx". */
  language?: string
  /** The rendered result. Put an iframe, a component or a document here. */
  children?: React.ReactNode
  /** How many versions exist. With more than one, arrows to step through them appear. */
  versions?: number
  /** Which version is shown, starting at 1 (controlled). */
  version?: number
  /** Called when the version changes. */
  onVersionChange?: (version: number) => void
  /** True while the model is still writing. Shows a progress edge and disables copy and download. */
  streaming?: boolean
  /** Tab shown first. */
  defaultTab?: "preview" | "code"
  /** Adds a close button. */
  onClose?: () => void
  /** Called after the code was copied. */
  onCopy?: () => void
  /** Extra header actions, placed before Copy. */
  actions?: React.ReactNode
  /** Classes for the preview canvas. */
  previewClassName?: string
}

const iconButton =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4"

function ArtifactPanel({
  title,
  kind,
  icon,
  code,
  filename,
  language,
  children,
  versions = 1,
  version: versionProp,
  onVersionChange,
  streaming = false,
  defaultTab = "preview",
  onClose,
  onCopy,
  actions,
  previewClassName,
  className,
  ...props
}: ArtifactPanelProps) {
  const reduce = useReducedMotion()
  const [internalVersion, setInternalVersion] = React.useState(versions)
  const version = Math.min(Math.max(versionProp ?? internalVersion, 1), versions)
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const hasCode = code !== undefined
  const hasPreview = children !== undefined && children !== null

  function go(next: number) {
    const clamped = Math.min(Math.max(next, 1), versions)
    setInternalVersion(clamped)
    onVersionChange?.(clamped)
  }

  async function copy() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      return
    }
    setCopied(true)
    onCopy?.()
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  function download() {
    if (!code) return
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = filename ?? "artifact.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabClass =
    "relative inline-flex h-7 items-center rounded-md px-3 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"

  return (
    <section
      data-slot="artifact-panel"
      aria-label={title}
      aria-busy={streaming || undefined}
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs",
        className
      )}
      {...props}
    >
      <TabsPrimitive.Root defaultValue={hasPreview ? defaultTab : "code"} className="flex min-h-0 flex-1 flex-col">
        <header className="relative flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2.5">
          <div className="flex min-w-[10rem] flex-1 items-center gap-2.5">
            {icon && (
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-foreground [&_svg]:size-4"
              >
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm leading-5 font-semibold text-foreground">{title}</h3>
              {(kind || streaming) && (
                <p className="truncate text-xs leading-4 text-muted-foreground">
                  {streaming ? "Writing…" : kind}
                </p>
              )}
            </div>
          </div>

          {hasPreview && hasCode && (
            <TabsPrimitive.List
              aria-label="View"
              className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5"
            >
              <TabsPrimitive.Trigger value="preview" className={tabClass}>
                Preview
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger value="code" className={tabClass}>
                Code
              </TabsPrimitive.Trigger>
            </TabsPrimitive.List>
          )}

          <div className="flex items-center gap-0.5">
            {versions > 1 && (
              <span className="mr-1 inline-flex items-center" role="group" aria-label="Versions">
                <button
                  type="button"
                  aria-label="Previous version"
                  disabled={version <= 1 || streaming}
                  onClick={() => go(version - 1)}
                  className={iconButton}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <span className="min-w-12 text-center font-mono text-xs text-muted-foreground tabular-nums" aria-live="polite">
                  v{version} <span aria-hidden="true">/ {versions}</span>
                  <span className="sr-only"> of {versions}</span>
                </span>
                <button
                  type="button"
                  aria-label="Next version"
                  disabled={version >= versions || streaming}
                  onClick={() => go(version + 1)}
                  className={iconButton}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </span>
            )}
            {actions}
            {hasCode && (
              <>
                <button
                  type="button"
                  aria-label={copied ? "Copied" : "Copy code"}
                  title={copied ? "Copied" : "Copy code"}
                  disabled={streaming}
                  onClick={copy}
                  className={iconButton}
                >
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  aria-label={`Download ${filename ?? "file"}`}
                  title="Download"
                  disabled={streaming}
                  onClick={download}
                  className={iconButton}
                >
                  <Download aria-hidden="true" />
                </button>
              </>
            )}
            {onClose && (
              <button type="button" aria-label="Close artifact" title="Close" onClick={onClose} className={iconButton}>
                <X aria-hidden="true" />
              </button>
            )}
          </div>
          {streaming && (
            <span aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-0.5 overflow-hidden">
              {reduce ? (
                <span className="block h-full w-full bg-foreground/30" />
              ) : (
                <motion.span
                  className="block h-full w-1/3 bg-foreground/70"
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </span>
          )}
        </header>

        {hasPreview && (
          <TabsPrimitive.Content
            value="preview"
            className={cn(
              "min-h-0 flex-1 overflow-auto bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] p-5 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50",
              previewClassName
            )}
            tabIndex={0}
          >
            {children}
          </TabsPrimitive.Content>
        )}
        {hasCode && (
          <TabsPrimitive.Content
            value="code"
            className="min-h-0 flex-1 overflow-auto bg-muted/30 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
            tabIndex={0}
          >
            {filename || language ? (
              <div className="sticky top-0 flex h-8 items-center gap-2 border-b bg-muted/60 px-4 font-mono text-[11px] text-muted-foreground backdrop-blur">
                {filename}
                {language && <span className="ml-auto uppercase">{language}</span>}
              </div>
            ) : null}
            <pre className="p-4 font-mono text-xs leading-5 text-foreground">
              <code>{code}</code>
              {streaming && (
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-foreground motion-reduce:animate-none"
                />
              )}
            </pre>
          </TabsPrimitive.Content>
        )}
      </TabsPrimitive.Root>
    </section>
  )
}

export { ArtifactPanel, type ArtifactPanelProps }
