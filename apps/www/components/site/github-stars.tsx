"use client"

import { Star } from "lucide-react"
import * as React from "react"

import { formatStars, REPO_URL, showStars } from "@/lib/github-stars"
import { cn } from "@/lib/utils"

const MARK = (
  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)

// The header and the home page both show the count; one request serves both.
let live: Promise<number | null> | undefined
const liveStars = () =>
  (live ??= fetch("/api/stars")
    .then((r) => (r.ok ? (r.json() as Promise<{ stars: number | null }>) : null))
    .then((d) => (typeof d?.stars === "number" ? d.stars : null))
    .catch(() => null))

/** The count: what the page was built with, then the live number from /api/stars (a cached Worker route). Not asked for in development. */
function useStars(initial: number | null) {
  const [stars, setStars] = React.useState(initial)
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    let current = true
    void liveStars().then((n) => {
      if (current && n !== null) setStars(n)
    })
    return () => {
      current = false
    }
  }, [])
  return stars
}

/** The GitHub link. `header` is an icon with the count beside it on wide screens; `hero` is a labelled pill. The count appears only once it is worth showing. */
export function GithubStars({ initial, variant = "header", className }: { initial: number | null; variant?: "header" | "hero"; className?: string }) {
  const stars = useStars(initial)
  const shown = showStars(stars)
  const label = shown ? `Ballmac UI on GitHub, ${stars.toLocaleString("en-US")} stars` : "Ballmac UI on GitHub"
  if (variant === "hero")
    return (
      <a
        href={REPO_URL}
        aria-label={shown ? label : "Star Ballmac UI on GitHub"}
        className={cn("text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px]", className)}
      >
        {MARK}
        <span>Star on GitHub</span>
        {shown && (
          <span className="text-foreground flex items-center gap-1 border-s ps-2 tabular-nums">
            <Star className="size-3 fill-current" aria-hidden="true" />
            {formatStars(stars)}
          </span>
        )}
      </a>
    )
  return (
    <a
      href={REPO_URL}
      aria-label={label}
      className={cn("text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 hidden h-8 items-center justify-center gap-1.5 rounded-md outline-none focus-visible:ring-[3px] sm:inline-flex", shown ? "px-2" : "w-8", className)}
    >
      {MARK}
      {shown && <span className="text-[13px] font-medium tabular-nums">{formatStars(stars)}</span>}
    </a>
  )
}
