// Ballmac UI: Gallery 1. https://ui.ballmac.com/blocks/gallery-1
"use client"

import * as React from "react"
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, ImageOff, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt, type CoverArtVariant } from "@/components/ballmac/cover-art"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ballmac/dialog"
import { MasonryGrid, MasonryItem } from "@/components/ballmac/masonry-grid"
import { Media, type MediaSource } from "@/components/ballmac/media"
import { Skeleton } from "@/components/ballmac/skeleton"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useDirection } from "@/lib/ballmac/direction"
import { cn } from "@/lib/utils"

type Gallery1Ratio = "square" | "landscape" | "portrait" | "tall"

type Gallery1Item = {
  id: string
  title: string
  /** A sentence under the picture in the lightbox. */
  caption?: string
  /** A short line next to the title ("Lisbon, 2026"). */
  meta?: string
  category: string
  /** The picture. Leave out and art is drawn from the id, so the gallery looks finished before you have photos. */
  src?: MediaSource
  /** Describes the picture. Required when `src` is set; use "" for decoration. */
  alt?: string
  /** The shape of the tile. */
  ratio?: Gallery1Ratio
  /** Where the full-size original lives. Adds a link in the lightbox. */
  href?: string
}

type Gallery1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    items?: Gallery1Item[]
    title?: string
    description?: string
    /** The category shown at first, or "all". */
    defaultCategory?: string
    /** Called when a picture is opened in the lightbox. */
    onOpen?: (item: Gallery1Item) => void
    /** The id of a picture that is open in the lightbox at first. */
    defaultOpenId?: string
  }

const ratios: Record<Gallery1Ratio, string> = {
  square: "aspect-square",
  landscape: "aspect-[3/2]",
  portrait: "aspect-[4/5]",
  tall: "aspect-[3/4]",
}
const variants: CoverArtVariant[] = ["mesh", "rings", "bars", "dots", "waves"]

const sample: Gallery1Item[] = [
  { id: "g1", title: "The Lisbon studio", caption: "Our first office, above a bakery. The morning light on the long table is why we stayed.", meta: "Lisbon, 2024", category: "Offices", ratio: "landscape" },
  { id: "g2", title: "Launch day", caption: "Everyone in one room when version 2 went live, with pizza that arrived late.", meta: "March 2026", category: "Events", ratio: "portrait" },
  { id: "g3", title: "The first prototype", caption: "A paper model of the sidebar, taped to a window and argued over for a week.", meta: "2023", category: "Product", ratio: "square" },
  { id: "g4", title: "Design offsite", caption: "Two days in the mountains, no laptops until the second afternoon.", meta: "Serra da Estrela", category: "Team", ratio: "tall" },
  { id: "g5", title: "Standing desks", caption: "The new floor, with room for the support team to sit next to engineering.", meta: "Porto, 2026", category: "Offices", ratio: "square" },
  { id: "g6", title: "Conference talk", caption: "Mara on stage explaining why empty states deserve a designer.", meta: "Berlin, 2025", category: "Events", ratio: "landscape" },
  { id: "g7", title: "Sketching the dashboard", caption: "Four weeks of whiteboards before a single pixel was drawn.", meta: "2025", category: "Product", ratio: "portrait" },
  { id: "g8", title: "Friday lunch", caption: "The one rule: nobody talks about work for the first twenty minutes.", meta: "Every week", category: "Team", ratio: "landscape" },
  { id: "g9", title: "The wall of notes", caption: "Every customer letter we have kept, pinned where we pass it daily.", meta: "Lisbon", category: "Offices", ratio: "tall" },
  { id: "g10", title: "Community meetup", caption: "Sixty people, a projector and a very patient host.", meta: "Lisbon, 2025", category: "Events", ratio: "square" },
  { id: "g11", title: "Color study", caption: "Forty swatches narrowed to five over one long lunch.", meta: "2024", category: "Product", ratio: "landscape" },
  { id: "g12", title: "The whole team", caption: "Twenty-three people on one staircase, and one blurry photographer.", meta: "Autumn 2026", category: "Team", ratio: "portrait" },
]

function GallerySkeleton() {
  const heights = ["h-56", "h-72", "h-48", "h-64", "h-80", "h-52"]
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {heights.map((h, i) => (
        <div key={i} className="grid gap-2">
          <Skeleton className={cn("rounded-2xl", h)} />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      ))}
    </div>
  )
}

function Picture({ item, index, className, fit = "cover" }: { item: Gallery1Item; index: number; className?: string; fit?: "cover" | "contain" }) {
  return (
    <Media
      media={item.src}
      alt={item.alt ?? ""}
      fit={fit}
      fill
      className={cn("absolute inset-0", className)}
      fallback={<CoverArt seed={item.id} variant={variants[index % variants.length]} grid className="absolute inset-0" />}
    />
  )
}

/**
 * A photo gallery: filter chips with counts, a gap-free masonry of tiles that fade in, and a lightbox with the caption, a counter, a
 * thumbnail strip, arrow-key and swipe navigation (mirrored in right-to-left), and a link to the original.
 */
function Gallery1({
  items = sample,
  title = "Life at Acme",
  description = "Offices, launches and the people behind the work.",
  defaultCategory = "all",
  onOpen,
  defaultOpenId,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Gallery1Props) {
  const id = React.useId()
  const dir = useDirection()
  const [category, setCategory] = React.useState(defaultCategory)
  const [openIndex, setOpenIndex] = React.useState<number | null>(() => {
    const at = defaultOpenId ? items.filter((i) => defaultCategory === "all" || i.category === defaultCategory).findIndex((i) => i.id === defaultOpenId) : -1
    return at >= 0 ? at : null
  })
  const swipe = React.useRef<number | null>(null)
  const ready = state === "ready" || state === "empty"

  const categories = [...new Set(items.map((i) => i.category))]
  const list = state === "empty" ? [] : items
  const filtered = list.filter((i) => category === "all" || i.category === category)
  const current = openIndex !== null ? filtered[openIndex] : undefined
  const returnFocus = useReturnFocus(current !== undefined)
  const indexInAll = (item: Gallery1Item) => items.findIndex((x) => x.id === item.id)

  const go = (delta: number) => setOpenIndex((i) => (i === null || !filtered.length ? i : (i + delta + filtered.length) % filtered.length))
  const open = (index: number) => {
    setOpenIndex(index)
    const item = filtered[index]
    if (item) onOpen?.(item)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight"
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft"
    if (e.key === forward) {
      e.preventDefault()
      go(1)
    } else if (e.key === back) {
      e.preventDefault()
      go(-1)
    } else if (e.key === "Home") {
      e.preventDefault()
      setOpenIndex(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setOpenIndex(filtered.length - 1)
    }
  }

  const content = (
    <>
      {categories.length > 1 ? (
        <fieldset className="mb-8" disabled={!ready}>
          <legend className="sr-only">Category</legend>
          <div className="flex flex-wrap gap-2">
            {[{ key: "all", label: "All", n: list.length }, ...categories.map((c) => ({ key: c, label: c, n: list.filter((i) => i.category === c).length }))].map((c) => (
              <label
                key={c.key}
                className="has-[:focus-visible]:ring-ring/50 hover:bg-accent/60 has-[:checked]:bg-foreground has-[:checked]:text-background has-[:checked]:border-foreground flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors duration-150 has-[:focus-visible]:ring-[3px]"
              >
                <input type="radio" name={`${id}-cat`} value={c.key} checked={category === c.key} onChange={() => setCategory(c.key)} className="sr-only" />
                {c.label}{" "}
                <span className="text-xs tabular-nums opacity-70">{c.n}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {filtered.length ? (
        <MasonryGrid key={category} columns={{ base: 1, sm: 2, lg: 3 }} gap="lg" reveal>
          {filtered.map((item, i) => (
            <MasonryItem key={item.id}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => open(i)}
                className="group/tile focus-visible:ring-ring/50 block w-full rounded-2xl text-start outline-none focus-visible:ring-[3px]"
              >
                <span className={cn("bg-muted relative block w-full overflow-hidden rounded-2xl border shadow-xs", ratios[item.ratio ?? "landscape"])}>
                  <Picture item={item} index={indexInAll(item)} className="transition-transform duration-700 ease-out group-hover/tile:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100" />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100 motion-reduce:transition-none" />
                  <span aria-hidden="true" className="bg-background/90 text-foreground absolute end-3 top-3 flex size-8 translate-y-1 items-center justify-center rounded-full opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100 motion-reduce:transition-none">
                    <Expand className="size-4" />
                  </span>
                </span>
                <span className="mt-3 flex items-baseline justify-between gap-3 px-1">
                  <span className="min-w-0 text-sm font-medium tracking-tight text-pretty">{item.title}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">{item.category}</span>
                </span>
                {item.meta ? <span className="text-muted-foreground mt-0.5 block px-1 text-xs">{item.meta}</span> : null}
              </button>
            </MasonryItem>
          ))}
        </MasonryGrid>
      ) : (
        <div className="bg-card rounded-2xl border px-6 py-16 text-center">
          <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
            <ImageOff className="size-6" />
          </span>
          <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? (list.length ? "Nothing in this category yet" : "No pictures yet")}</h2>
          <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? (list.length ? "Try another category to see more." : "Pictures will appear here as they are added.")}</p>
          {list.length ? (
            <Button variant="outline" size="sm" className="mt-5" onClick={() => setCategory("all")}>
              Show everything
            </Button>
          ) : (
            emptyState?.action
          )}
        </div>
      )}
    </>
  )

  return (
    <section data-slot="gallery-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-10 max-w-2xl">
        <h1 id={`${id}-title`} className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-base text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading pictures" loading={<GallerySkeleton />} error={{ title: errorState?.title ?? "The pictures could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>

      <Dialog open={current !== undefined} onOpenChange={(o) => !o && setOpenIndex(null)}>
        {current ? (
          <DialogContent showCloseButton={false} onKeyDown={onKeyDown} {...returnFocus} className="max-w-5xl gap-0 overflow-hidden p-0 sm:p-0">
            <DialogTitle className="sr-only">{current.title}</DialogTitle>
            <DialogDescription className="sr-only">
              Picture {(openIndex ?? 0) + 1} of {filtered.length}. Use the left and right arrow keys to move between pictures.
            </DialogDescription>
            <div
              className="bg-muted relative h-[min(60dvh,34rem)] touch-pan-y select-none"
              onPointerDown={(e) => (swipe.current = e.clientX)}
              onPointerUp={(e) => {
                if (swipe.current === null) return
                const dx = e.clientX - swipe.current
                swipe.current = null
                if (Math.abs(dx) > 60) go((dx < 0 ? 1 : -1) * (dir === "rtl" ? -1 : 1))
              }}
            >
              <Picture item={current} index={indexInAll(current)} fit="contain" />
              <DialogClose aria-label="Close" className="bg-background/85 hover:bg-background focus-visible:ring-ring/50 absolute end-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border shadow-sm backdrop-blur outline-none focus-visible:ring-[3px]">
                <X aria-hidden="true" className="size-4" />
              </DialogClose>
              {filtered.length > 1 ? (
                <>
                  <button type="button" aria-label="Previous picture" onClick={() => go(-1)} className="bg-background/85 hover:bg-background focus-visible:ring-ring/50 absolute start-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur outline-none focus-visible:ring-[3px]">
                    <ChevronLeft aria-hidden="true" className="size-5 rtl:rotate-180" />
                  </button>
                  <button type="button" aria-label="Next picture" onClick={() => go(1)} className="bg-background/85 hover:bg-background focus-visible:ring-ring/50 absolute end-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur outline-none focus-visible:ring-[3px]">
                    <ChevronRight aria-hidden="true" className="size-5 rtl:rotate-180" />
                  </button>
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 border-t p-5">
              <div className="min-w-0 flex-1 basis-72">
                <h2 className="text-lg font-semibold tracking-tight text-pretty">{current.title}</h2>
                {current.caption ? <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-pretty">{current.caption}</p> : null}
                <p className="text-muted-foreground mt-2 text-xs">
                  {current.category}
                  {current.meta ? ` · ${current.meta}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground text-sm tabular-nums" aria-hidden="true">
                  {(openIndex ?? 0) + 1} / {filtered.length}
                </p>
                {current.href ? (
                  <a href={current.href} className="focus-visible:ring-ring/50 hover:bg-accent inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium outline-none focus-visible:ring-[3px]">
                    Open original
                    <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
                  </a>
                ) : null}
              </div>
            </div>
            {filtered.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t p-3" role="group" aria-label="All pictures">
                {filtered.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Picture ${i + 1}: ${item.title}`}
                    aria-current={i === openIndex ? "true" : undefined}
                    onClick={() => setOpenIndex(i)}
                    className={cn("bg-muted focus-visible:ring-ring/50 relative size-14 shrink-0 overflow-hidden rounded-lg border outline-none transition-[opacity,box-shadow] duration-150 focus-visible:ring-[3px]", i === openIndex ? "ring-foreground ring-2 ring-offset-2 ring-offset-card" : "opacity-60 hover:opacity-100")}
                  >
                    <Picture item={item} index={indexInAll(item)} />
                  </button>
                ))}
              </div>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  )
}

export { Gallery1, type Gallery1Props, type Gallery1Item, type Gallery1Ratio }
