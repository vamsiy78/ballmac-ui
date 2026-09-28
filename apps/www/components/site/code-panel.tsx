import { CopyButton } from "@/components/site/copy-button"
import { highlight } from "@/lib/registry"
import { cn } from "@/lib/utils"

/** Server-highlighted code with a copy button and an optional file label. */
export async function CodePanel({
  code,
  lang = "tsx",
  title,
  className,
  maxHeight = true,
}: {
  code: string
  lang?: "tsx" | "bash" | "json" | "css"
  title?: string
  className?: string
  maxHeight?: boolean
}) {
  const html = await highlight(code, lang)
  return (
    <div className={cn("bg-card overflow-hidden rounded-xl border", className)}>
      {title && (
        <div className="flex h-10 items-center justify-between border-b px-4">
          <span className="text-muted-foreground font-mono text-xs">{title}</span>
          <CopyButton value={code} />
        </div>
      )}
      <div className="flex items-start">
        <div
          className={cn("min-w-0 flex-1 overflow-auto px-4 py-3.5 [&_pre]:outline-none", maxHeight && "max-h-[480px]")}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {!title && <CopyButton value={code} className="m-2.5 shrink-0" />}
      </div>
    </div>
  )
}
