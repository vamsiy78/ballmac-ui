"use client"

import { Sparkles } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { useProFlag } from "@/components/pro/session"
import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

/** The header's door to Pro: "Log in" and "Get Pro" for visitors, a "Pro" pill that opens the library for buyers. */
export function ProAccount({ className }: { className?: string }) {
  const signedIn = useProFlag()
  if (signedIn) {
    return (
      <Link href="/pro" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5", className)} aria-label="Your Pro library">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Pro library
      </Link>
    )
  }
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Link href="/pro" className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "hidden sm:inline-flex")}>
        Log in
      </Link>
      <Link href="/pricing" className={buttonVariants({ size: "sm" })}>
        Get Pro
      </Link>
    </div>
  )
}
