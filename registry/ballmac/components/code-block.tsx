// Ballmac UI: Code Block. https://ui.ballmac.com/components/code-block
"use client"

import * as React from "react"
import { Check, Copy, FileCode2, WrapText } from "lucide-react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

/* -------------------------------------------------------------------------------------------------
 * Shared pieces
 * -----------------------------------------------------------------------------------------------*/

function CopyCodeButton({ getText, label }: { getText: () => string; label?: string }) {
  const msg = useMessages()
  label ??= msg("code-block.label", "Copy code")
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <>
      <button
        type="button"
        data-slot="code-block-copy"
        aria-label={copied ? msg("code-block.copied", "Copied") : label}
        title={label}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(getText())
          } catch {
            return
          }
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), 1800)
        }}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}

function WrapToggle({ wrap, onWrapChange }: { wrap: boolean; onWrapChange: (wrap: boolean) => void }) {
  const msg = useMessages()
  return (
    <button
      type="button"
      data-slot="code-block-wrap"
      aria-label={msg("code-block.wrapLines", "Wrap lines")}
      aria-pressed={wrap}
      title={msg("code-block.wrapLines", "Wrap lines")}
      onClick={() => onWrapChange(!wrap)}
      className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-accent aria-pressed:text-foreground"
    >
      <WrapText aria-hidden="true" className="size-3.5" />
    </button>
  )
}

type CodeBodyProps = {
  code?: string
  children?: React.ReactNode
  lineNumbers: boolean
  highlight: number[]
  wrap: boolean
  label: string
  codeRef: React.RefObject<HTMLDivElement | null>
  className?: string
}

/**
 * Lines are `<span class="line">`, the same structure Shiki emits, so line numbers (a CSS counter)
 * work for plain `code` and for pre-highlighted children alike.
 */
function CodeBody({ code, children, lineNumbers, highlight, wrap, label, codeRef, className }: CodeBodyProps) {
  const lines = React.useMemo(() => (code ?? "").replace(/\n$/, "").split("\n"), [code])
  const highlighted = React.useMemo(() => new Set(highlight), [highlight])
  return (
    <div
      ref={codeRef}
      data-slot="code-block-body"
      data-line-numbers={lineNumbers || undefined}
      data-wrap={wrap || undefined}
      tabIndex={0}
      role="region"
      aria-label={label}
      className={cn(
        "overflow-x-auto py-3 font-mono text-[13px] leading-6 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
        lineNumbers &&
          "[counter-reset:line] [&_.line]:before:[counter-increment:line] [&_.line]:before:me-4 [&_.line]:before:inline-block [&_.line]:before:w-[3ch] [&_.line]:before:text-end [&_.line]:before:text-muted-foreground/60 [&_.line]:before:content-[counter(line)] [&_.line]:before:select-none",
        // Pre-highlighted children (e.g. Shiki's <pre>) keep their colors but lose their own box.
        "[&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:p-0 [&_pre]:font-mono",
        wrap ? "[&_pre]:whitespace-pre-wrap [&_pre]:break-words" : "[&_pre]:whitespace-pre",
        className
      )}
    >
      {code !== undefined ? (
        <pre dir="ltr" className={cn("min-w-full", wrap ? "w-full" : "w-max")}>
          <code className="block">
            {lines.map((line, i) => (
              <span
                key={i}
                data-highlighted={highlighted.has(i + 1) || undefined}
                className="line block px-4 data-[highlighted]:bg-accent data-[highlighted]:shadow-[inset_2px_0_0_0_var(--ring)]"
              >
                {line || " "}
              </span>
            ))}
          </code>
        </pre>
      ) : (
        <div className="px-4">{children}</div>
      )}
    </div>
  )
}

const headerClass = "flex h-10 min-w-0 items-center gap-2 border-b bg-muted/40 pe-1.5 ps-3.5"

/* -------------------------------------------------------------------------------------------------
 * CodeBlock
 * -----------------------------------------------------------------------------------------------*/

type CodeBlockProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Source as plain text. Rendered unhighlighted in monospace; required for `highlight`. */
  code?: string
  /** Pre-highlighted markup (e.g. Shiki's output as JSX) used instead of `code`. Pass `code` too so copy gets clean text. */
  children?: React.ReactNode
  /** Shown in the header, e.g. "app/page.tsx". */
  filename?: string
  /** Language label shown in the header, e.g. "tsx". */
  language?: string
  /** Show line numbers. */
  lineNumbers?: boolean
  /** 1-based line numbers to highlight (plain `code` only). */
  highlight?: number[]
  /** Wrap long lines instead of scrolling horizontally (initial value when the toggle is shown). */
  wrap?: boolean
  /** Show a button that toggles line wrapping. */
  wrapToggle?: boolean
  /** Show the copy button. */
  copyable?: boolean
  /** Classes for the scrolling body, e.g. a max height. */
  bodyClassName?: string
}

function CodeBlock({
  code,
  children,
  filename,
  language,
  lineNumbers = false,
  highlight = [],
  wrap: wrapProp = false,
  wrapToggle = false,
  copyable = true,
  bodyClassName,
  className,
  ...props
}: CodeBlockProps) {
  const [wrap, setWrap] = React.useState(wrapProp)
  React.useEffect(() => setWrap(wrapProp), [wrapProp])
  const codeRef = React.useRef<HTMLDivElement>(null)
  const getText = () => code ?? codeRef.current?.textContent ?? ""
  const hasHeader = Boolean(filename || language)

  return (
    <div
      data-slot="code-block"
      className={cn("group/code relative w-full min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      {hasHeader ? (
        <div data-slot="code-block-header" className={headerClass}>
          {filename ? (
            <>
              <FileCode2 aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono text-xs text-foreground">{filename}</span>
            </>
          ) : null}
          {language ? (
            <span className="ms-auto shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{language}</span>
          ) : null}
          <span className={cn("flex shrink-0 items-center", !language && "ms-auto")}>
            {wrapToggle ? <WrapToggle wrap={wrap} onWrapChange={setWrap} /> : null}
            {copyable ? <CopyCodeButton getText={getText} /> : null}
          </span>
        </div>
      ) : wrapToggle || copyable ? (
        <div className="absolute top-1.5 end-1.5 z-10 flex items-center rounded-md bg-card/90">
          {wrapToggle ? <WrapToggle wrap={wrap} onWrapChange={setWrap} /> : null}
          {copyable ? <CopyCodeButton getText={getText} /> : null}
        </div>
      ) : null}
      <CodeBody
        code={children == null ? (code ?? "") : undefined}
        lineNumbers={lineNumbers}
        highlight={highlight}
        wrap={wrap}
        label={filename ?? (language ? `${language} code` : "Code")}
        codeRef={codeRef}
        className={cn(!hasHeader && (copyable || wrapToggle) && "pe-10", bodyClassName)}
      >
        {children}
      </CodeBody>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * CodeBlockTabs
 * -----------------------------------------------------------------------------------------------*/

type CodeBlockFile = {
  /** Tab label and region name, e.g. "components/ballmac/button.tsx". */
  filename: string
  /** Plain source. */
  code: string
  /** Language label for this file. */
  language?: string
  /** 1-based lines to highlight. */
  highlight?: number[]
  /** Pre-highlighted markup for this file (copy still uses `code`). */
  children?: React.ReactNode
}

type CodeBlockTabsProps = Omit<React.ComponentProps<"div">, "children" | "defaultValue" | "dir"> & {
  /** One tab per file. */
  files: CodeBlockFile[]
  /** Filename of the tab open at first. */
  defaultValue?: string
  /** Controlled open tab (a filename). */
  value?: string
  /** Called with the filename of the newly selected tab. */
  onValueChange?: (filename: string) => void
  /** Show line numbers. */
  lineNumbers?: boolean
  /** Wrap long lines instead of scrolling horizontally. */
  wrap?: boolean
  /** Show the copy button (copies the open file). */
  copyable?: boolean
  /** Classes for each scrolling body. */
  bodyClassName?: string
}

function CodeBlockTabs({
  files,
  defaultValue,
  value: valueProp,
  onValueChange,
  lineNumbers = false,
  wrap = false,
  copyable = true,
  bodyClassName,
  className,
  ...props
}: CodeBlockTabsProps) {
  const msg = useMessages()
  const [internal, setInternal] = React.useState(defaultValue ?? files[0]?.filename ?? "")
  const value = valueProp ?? internal
  const current = files.find((f) => f.filename === value) ?? files[0]
  const codeRef = React.useRef<HTMLDivElement>(null)

  return (
    <TabsPrimitive.Root
      data-slot="code-block-tabs"
      value={current?.filename}
      onValueChange={(next) => {
        if (valueProp === undefined) setInternal(next)
        onValueChange?.(next)
      }}
      className={cn("w-full min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground", className)}
      {...props}
    >
      <div className={cn(headerClass, "ps-1.5")}>
        <TabsPrimitive.List
          aria-label={msg("code-block.files", "Files")}
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]"
        >
          {files.map((file) => (
            <TabsPrimitive.Trigger
              key={file.filename}
              value={file.filename}
              className="relative h-10 shrink-0 px-2.5 font-mono text-xs text-muted-foreground outline-none transition-colors duration-150 after:absolute after:inset-x-2.5 after:bottom-0 after:h-px after:bg-transparent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset data-[state=active]:text-foreground data-[state=active]:after:bg-foreground"
            >
              {file.filename.split("/").pop()}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {current?.language ? (
          <span className="shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{current.language}</span>
        ) : null}
        {copyable ? <CopyCodeButton getText={() => current?.code ?? codeRef.current?.textContent ?? ""} /> : null}
      </div>
      {files.map((file) => (
        <TabsPrimitive.Content key={file.filename} value={file.filename} tabIndex={-1} className="outline-none">
          <CodeBody
            code={file.children == null ? file.code : undefined}
            lineNumbers={lineNumbers}
            highlight={file.highlight ?? []}
            wrap={wrap}
            label={file.filename}
            codeRef={codeRef}
            className={bodyClassName}
          >
            {file.children}
          </CodeBody>
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}

export { CodeBlock, CodeBlockTabs, type CodeBlockProps, type CodeBlockTabsProps, type CodeBlockFile }
