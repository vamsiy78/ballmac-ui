// Ballmac UI: Listing 1. https://ui.ballmac.com/blocks/listing-1
"use client"

import * as React from "react"
import { Bath, BedDouble, CalendarCheck, ChevronLeft, ChevronRight, Loader2, Ruler, UserRound } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Media, type MediaSource } from "@/components/ballmac/media"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Listing1Photo = {
  /** A picture. Leave it out and generated artwork stands in, so the page looks finished before you have photos. */
  media?: MediaSource
  /** Describes the picture, for example "The living room, with a bay window". */
  alt: string
}

type Listing1Data = {
  /** The street address, for example "14 Garden Row". */
  address: string
  city: string
  /** Price as a number. */
  price: number
  /** "For sale" or "To rent". */
  offer: "For sale" | "To rent"
  /** Shown after the price when renting, such as "per month". */
  per?: string
  type: string
  beds: number
  baths: number
  /** Floor area in square metres. */
  area: number
  description: string
  features: string[]
  photos: Listing1Photo[]
  agent: { name: string; role: string; phone?: string }
  /** Times someone can come to see it. */
  viewings: { id: string; label: string }[]
}

type Listing1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    listing?: Listing1Data | null
    /** ISO currency code. */
    currency?: string
    /** Called with the chosen time and the person's details. Reject and the form keeps what was typed. */
    onRequestViewing?: (request: { viewingId: string; name: string; email: string }) => void | Promise<void>
  }

const sample: Listing1Data = {
  address: "14 Garden Row",
  city: "Lisbon",
  price: 485000,
  offer: "For sale",
  type: "Apartment",
  beds: 3,
  baths: 2,
  area: 118,
  description: "A bright corner apartment on the third floor of a restored 1920s building. Tall windows face south and west, the kitchen opens onto a dining area, and the main bedroom has its own bathroom. A shared courtyard garden and a storage room are included.",
  features: ["South and west light", "Restored wooden floors", "Courtyard garden", "Storage room", "Lift", "Five minutes from the metro"],
  photos: [
    { alt: "The living room, with tall windows and wooden floors" },
    { alt: "The kitchen and dining area" },
    { alt: "The main bedroom" },
    { alt: "The courtyard garden" },
  ],
  agent: { name: "Catarina Mendes", role: "Sales agent", phone: "+351 21 000 0000" },
  viewings: [{ id: "v1", label: "Sat 25 Oct, 10:00" }, { id: "v2", label: "Sat 25 Oct, 11:30" }, { id: "v3", label: "Tue 28 Oct, 18:00" }],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="grid gap-3">
        <Skeleton className="aspect-[16/10] rounded-2xl" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

/**
 * A property page: a gallery you can step through with buttons or the arrow keys, the price and the facts that matter, the description and features, and a
 * form to ask for a viewing at one of the offered times. Pictures go through `Media`, with generated artwork until you have photos.
 */
function Listing1({ listing = sample, currency = "USD", onRequestViewing, state = "ready", onRetry, emptyState, errorState, className, ...props }: Listing1Props) {
  const id = React.useId()
  const [photo, setPhoto] = React.useState(0)
  const [slot, setSlot] = React.useState<string>("")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && !listing ? "empty" : state
  const nameBad = touched && !name.trim()
  const emailBad = touched && !/^\S+@\S+\.\S+$/.test(email)
  const slotBad = touched && !slot

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || !slot || !listing) return
    setBusy(true)
    setResult(null)
    try {
      await onRequestViewing?.({ viewingId: slot, name: name.trim(), email })
      setResult({ ok: true, text: `Requested for ${listing.viewings.find((v) => v.id === slot)?.label}. ${listing.agent.name} will confirm by email.` })
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "The request was not sent. What you typed is still here." })
    } finally {
      setBusy(false)
    }
  }
  const price = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
  const photos = listing?.photos ?? []
  const go = (d: number) => setPhoto((p) => (p + d + photos.length) % Math.max(photos.length, 1))

  return (
    <section data-slot="listing-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={view} onRetry={onRetry} label="Loading the listing" loading={<Skel />} empty={{ title: "This listing is no longer available", description: "It may have been sold or taken down. Browse other properties from the search page.", ...emptyState }} error={{ title: "The listing could not be loaded", description: "Check your connection and try again.", ...errorState }}>
        {listing && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="grid min-w-0 content-start gap-6">
              <div className="grid gap-3" role="group" aria-roledescription="gallery" aria-label={`Photos of ${listing.address}`} onKeyDown={(e) => { if (e.key === "ArrowRight") go(e.currentTarget.dir === "rtl" ? -1 : 1); if (e.key === "ArrowLeft") go(e.currentTarget.dir === "rtl" ? 1 : -1) }}>
                <div className="bg-muted relative overflow-hidden rounded-2xl">
                  <Media key={photo} media={photos[photo]?.media} alt={photos[photo]?.alt ?? ""} aspect="16/10" priority={photo === 0} fallback={<CoverArt seed={`${listing.address}-${photo}`} variant="mesh" grid className="absolute inset-0" />} />
                  {photos.length > 1 && (
                    <>
                      <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className="bg-background/90 focus-visible:ring-ring/50 absolute start-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow outline-none focus-visible:ring-[3px]">
                        <ChevronLeft aria-hidden="true" className="size-5 rtl:rotate-180" />
                      </button>
                      <button type="button" aria-label="Next photo" onClick={() => go(1)} className="bg-background/90 focus-visible:ring-ring/50 absolute end-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow outline-none focus-visible:ring-[3px]">
                        <ChevronRight aria-hidden="true" className="size-5 rtl:rotate-180" />
                      </button>
                      <p aria-live="polite" className="bg-background/90 absolute end-3 bottom-3 rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums">{photo + 1} of {photos.length}</p>
                    </>
                  )}
                </div>
                {photos.length > 1 && (
                  <ul className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((p, i) => (
                      <li key={i} className="shrink-0">
                        <button type="button" aria-label={`Show photo ${i + 1}: ${p.alt}`} aria-current={i === photo} onClick={() => setPhoto(i)} className={cn("focus-visible:ring-ring/50 relative block h-16 w-24 overflow-hidden rounded-lg border outline-none focus-visible:ring-[3px]", i === photo ? "ring-foreground ring-2" : "opacity-70 hover:opacity-100")}>
                          <Media media={p.media} alt="" fill className="absolute inset-0" fallback={<CoverArt seed={`${listing.address}-${i}`} variant="mesh" className="absolute inset-0" />} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="text-muted-foreground text-sm font-medium">{listing.type} · {listing.offer}</p>
                <h1 id={`${id}-title`} className="mt-1 text-3xl font-semibold tracking-[-0.035em] text-balance">{listing.address}</h1>
                <p className="text-muted-foreground">{listing.city}</p>
                <p className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight tabular-nums">{price(listing.price)}</span>{listing.per && <span className="text-muted-foreground text-sm">{listing.per}</span>}</p>
                <dl className="mt-5 grid grid-cols-3 gap-3">
                  {([[BedDouble, "Bedrooms", listing.beds], [Bath, "Bathrooms", listing.baths], [Ruler, "Area", `${listing.area} m²`]] as const).map(([Icon, label, v]) => (
                    <div key={label} className="bg-card rounded-xl border p-3.5">
                      <dt className="text-muted-foreground flex items-center gap-1.5 text-xs"><Icon aria-hidden="true" className="size-3.5" /> {label}</dt>
                      <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-muted-foreground mt-6 leading-relaxed text-pretty">{listing.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Features">
                  {listing.features.map((f) => (
                    <li key={f} className="rounded-full border px-3 py-1 text-sm">{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
              <form onSubmit={submit} noValidate className="bg-card grid gap-4 rounded-2xl border p-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight"><CalendarCheck aria-hidden="true" className="size-5" /> Ask for a viewing</h2>
                <fieldset className="grid gap-2" aria-describedby={slotBad ? `${id}-slot-err` : undefined}>
                  <legend className="mb-1 text-sm font-medium">Choose a time</legend>
                  {listing.viewings.map((v) => (
                    <label key={v.id} className="relative block cursor-pointer">
                      <input type="radio" name={`${id}-slot`} value={v.id} checked={slot === v.id} onChange={() => setSlot(v.id)} className="peer sr-only" />
                      <span className="peer-focus-visible:ring-ring/50 peer-checked:border-foreground peer-checked:bg-accent/50 flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm tabular-nums peer-focus-visible:ring-[3px]">{v.label}</span>
                    </label>
                  ))}
                  {slotBad && <p id={`${id}-slot-err`} className="text-destructive text-xs font-medium">Choose a time.</p>}
                </fieldset>
                <div className="grid gap-1.5">
                  <label htmlFor={`${id}-name`} className="text-sm font-medium">Your name</label>
                  <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={nameBad} aria-describedby={nameBad ? `${id}-name-err` : undefined} className="bg-background focus-visible:ring-ring/50 aria-invalid:border-destructive h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]" />
                  {nameBad && <p id={`${id}-name-err`} className="text-destructive text-xs font-medium">Enter your name.</p>}
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor={`${id}-email`} className="text-sm font-medium">Email</label>
                  <input id={`${id}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={emailBad} aria-describedby={emailBad ? `${id}-email-err` : undefined} className="bg-background focus-visible:ring-ring/50 aria-invalid:border-destructive h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]" />
                  {emailBad && <p id={`${id}-email-err`} className="text-destructive text-xs font-medium">Enter an email address like name@example.com.</p>}
                </div>
                <Button type="submit" size="lg" disabled={busy}>
                  {busy && <Loader2 aria-hidden="true" className="animate-spin" />} Request viewing
                </Button>
                <p aria-live="polite" role={result && !result.ok ? "alert" : undefined} className={cn("text-sm", result && !result.ok && "text-destructive font-medium")}>{result?.text}</p>
                <div className="flex items-center gap-3 border-t pt-4">
                  <span aria-hidden="true" className="bg-muted flex size-10 items-center justify-center rounded-full"><UserRound className="size-5" /></span>
                  <p className="text-sm"><span className="block font-medium">{listing.agent.name}</span><span className="text-muted-foreground">{listing.agent.role}{listing.agent.phone ? <> · <span dir="ltr">{listing.agent.phone}</span></> : null}</span></p>
                </div>
              </form>
            </aside>
          </div>
        )}
      </StateView>
    </section>
  )
}

export { Listing1, type Listing1Data, type Listing1Photo, type Listing1Props }
