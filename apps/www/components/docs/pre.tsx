import type { ComponentProps, ReactNode } from "react"

import { CopyButton } from "@/components/site/copy-button"
import { cn } from "@/lib/utils"

/** The text of a highlighted code element, for the copy button. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (typeof node === "object" && "props" in node) return textOf((node.props as { children?: ReactNode }).children)
  return ""
}

/**
 * A fenced code block: Shiki output from the MDX pipeline with an optional file name (title="app/page.tsx"), highlighted lines,
 * and a copy button. Line numbers come from the `showLineNumbers` flag (see lib/docs-source.ts).
 */
export function Pre({ title, icon, className, children, ...props }: ComponentProps<"pre"> & { title?: string; icon?: string }) {
  void icon // the file-type icon the highlighter adds; the title is enough
  const code = textOf(children).replace(/\n$/, "")
  return (
    // Code reads left to right in every language, as in an editor; the page around it mirrors.
    <div dir="ltr" className="bg-card not-prose my-5 overflow-hidden rounded-xl border text-start">
      {title && (
        <div className="flex h-10 items-center justify-between border-b ps-4 pe-2">
          <span className="text-muted-foreground font-mono text-xs">{title}</span>
          <CopyButton value={code} label="Copy code" />
        </div>
      )}
      <div className="flex items-start">
        <pre
          {...props}
          tabIndex={0}
          className={cn("focus-visible:ring-ring/50 max-h-[480px] min-w-0 flex-1 overflow-auto px-4 py-3.5 outline-none focus-visible:ring-[3px] focus-visible:ring-inset", className)}
        >
          {children}
        </pre>
        {!title && <CopyButton value={code} label="Copy code" className="m-2.5 shrink-0" />}
      </div>
    </div>
  )
}
