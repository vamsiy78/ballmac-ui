"use client"

import { ArrowRight, X } from "lucide-react"
import * as React from "react"

import Link from "@/components/site/link"

const KEY = "limited-offer-banner"
const EVENT = "limited-offer-banner-change"

const readStored = () => {
  try {
    return localStorage.getItem(KEY)
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
 * A slim strip under the header for the limited-time Pro price. Dismissible, and it stays dismissed for that price. It is in the server HTML so the page
 * does not jump; a visitor who dismissed it gets `data-founding-off` on <html> before first paint, and the rule in globals.css hides it.
 */
export function LimitedOfferBanner({ price, regular, href = "/pricing" }: { price: string; regular: string; href?: string }) {
  const id = `${price}-${regular}`
  const stored = React.useSyncExternalStore(subscribe, () => readStored() === id, () => false)
  const [closed, setClosed] = React.useState(false) // covers blocked storage, where a dismissal cannot be saved
  if (stored || closed) return null
  return (
    <>
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem(${JSON.stringify(KEY)})===${JSON.stringify(id)})document.documentElement.setAttribute("data-founding-off","")}catch(e){}` }}
      />
      <div data-founding-banner className="bg-foreground text-background relative" role="region" aria-label="Limited-time offer">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 pr-12 pl-4 text-center text-[13px] leading-5 sm:px-12">
          <p>
            <span className="font-semibold">Limited-time offer: Ballmac UI Pro is ${price}</span>, regular price <s className="opacity-70">${regular}</s>. One payment, yours to keep.
          </p>
          <Link href={href} className="focus-visible:ring-background/60 inline-flex items-center gap-1 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-2">
            Get Pro <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          aria-label="Dismiss the limited-time offer notice"
          onClick={() => {
            setClosed(true)
            document.documentElement.setAttribute("data-founding-off", "")
            try {
              localStorage.setItem(KEY, id)
              window.dispatchEvent(new Event(EVENT))
            } catch {
              // Not saved; it will show again next time.
            }
          }}
          className="hover:bg-background/15 focus-visible:ring-background/60 absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2 sm:right-4"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </>
  )
}
