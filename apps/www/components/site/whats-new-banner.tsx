"use client"

import { ArrowRight, Sparkles, X } from "lucide-react"
import * as React from "react"

import Link from "@/components/site/link"

const EVENT = "whats-new-banner-change"

const readStored = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null // storage can be blocked: show the banner
  }
}
const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(EVENT, onChange)
  }
}

/**
 * A slim, dismissible strip saying what is new in the free library. `id` names this announcement: dismissing it is remembered for that id only, so the next
 * announcement shows again. It is in the server HTML (no layout shift); a visitor who dismissed it gets `data-whatsnew-off` on <html> before first paint.
 */
export function WhatsNewBanner({ id, added, examples, href = "/changelog" }: { id: string; added: number; examples: string[]; href?: string }) {
  const key = "whats-new-banner"
  const stored = React.useSyncExternalStore(subscribe, () => readStored(key) === id, () => false)
  const [closed, setClosed] = React.useState(false)
  if (stored || closed) return null
  return (
    <>
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem(${JSON.stringify(key)})===${JSON.stringify(id)})document.documentElement.setAttribute("data-whatsnew-off","")}catch(e){}` }}
      />
      <div data-whatsnew-banner className="bg-muted/60 relative border-b" role="region" aria-label="What is new">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 pr-12 pl-4 text-center text-[13px] leading-5 sm:px-12">
          <p className="flex items-center gap-2">
            <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-semibold">{added} new items</span> in the free library, including {examples.join(", ")}.
            </span>
          </p>
          <Link href={href} className="focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">
            See what is new <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          aria-label="Dismiss the what is new notice"
          onClick={() => {
            setClosed(true)
            document.documentElement.setAttribute("data-whatsnew-off", "")
            try {
              localStorage.setItem(key, id)
              window.dispatchEvent(new Event(EVENT))
            } catch {
              // Not saved; it will show again next time.
            }
          }}
          className="hover:bg-foreground/10 focus-visible:ring-ring/50 absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] sm:right-4"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
