import Link from "@/components/site/link"
import { LockKeyhole } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"

/** Shown instead of source code for Pro items: the preview stays public, the code ships through the Pro registry. */
export function ProNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-muted/40 flex flex-col items-start gap-4 rounded-xl border p-6 sm:flex-row sm:items-center ${className}`}>
      <span className="bg-background flex size-10 shrink-0 items-center justify-center rounded-lg border" aria-hidden="true">
        <LockKeyhole className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">The source is part of Ballmac UI Pro.</p>
        <p className="text-muted-foreground mt-1 text-sm">Log in with your licence key to read and copy it here, or install it through the shadcn CLI or the MCP server. You own the code once it is in your project.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link href="/pricing" className={buttonVariants({ size: "sm" })}>Get Pro</Link>
        <Link href="/pro" className={buttonVariants({ size: "sm", variant: "outline" })}>Log in</Link>
      </div>
    </div>
  )
}

/** A small "Pro" label for cards and headings. */
export function ProBadge({ className = "" }: { className?: string }) {
  return <span className={`bg-foreground text-background inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold tracking-wide ${className}`}>PRO</span>
}
