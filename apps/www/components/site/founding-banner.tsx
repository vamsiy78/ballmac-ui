"use client"

import { ArrowRight, X } from "lucide-react"
import * as React from "react"

import Link from "@/components/site/link"
import { endsShort, type Founding } from "@/lib/founding"

const KEY = "founding-banner"
const EVENT = "founding-banner-change"

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
 * A slim strip under the header announcing the founding price. Dismissible, and it stays dismissed for that offer.
 *
 * It is in the server HTML, so the page does not jump when it loads (it used to appear after hydration and push the page down, a layout shift of
 * about 0.1 on the home and pricing pages). A visitor who dismissed it earlier gets `data-founding-off` on <html> from the script below before first
 * paint, and the rule in globals.css hides it, so a dismissed banner never flashes either.
 */
/** `phrase` is how long is left ("ends in 5 days"), worked out on the server so the banner matches what was rendered. */
export function FoundingBanner({ offer, phrase, href = "/pricing" }: { offer: Founding; phrase?: string | null; href?: string }) {
  const id = `${offer.limit}-${offer.price}`
  // Read from storage as an external store: the server renders it visible, then the browser adopts what the visitor chose.
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
      <div data-founding-banner className="bg-foreground text-background relative" role="region" aria-label="Founding price">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 pr-12 pl-4 text-center text-[13px] leading-5 sm:px-12">
          <p>
            <span className="font-semibold">Founding price: ${offer.price}</span>
            {offer.listPrice ? (
              <>
                , then <span className="font-semibold">${offer.listPrice}</span>
                {offer.endsAt ? <> after {endsShort(offer.endsAt)}</> : null}
              </>
            ) : null}
            . First <span className="font-semibold">{offer.limit}</span> buyers only{phrase ? <>. {phrase.charAt(0).toUpperCase() + phrase.slice(1)}</> : null}.
          </p>
          <Link href={href} className="focus-visible:ring-background/60 inline-flex items-center gap-1 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-2">
            Get Pro <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <button
          type="button"
          aria-label="Dismiss the founding price notice"
          onClick={() => {
            setClosed(true)
            // Hides it at once on the other pages you open in this session, before they mount.
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
