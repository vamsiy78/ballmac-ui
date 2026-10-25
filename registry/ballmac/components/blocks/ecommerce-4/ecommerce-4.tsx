// Ballmac UI: Ecommerce 4. https://ui.ballmac.com/blocks/ecommerce-4
"use client"

import * as React from "react"
import { Check, CircleCheck, Lock, Pencil } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { ProductArt, type ProductArtKind, type ProductArtTone } from "@/components/ballmac/product-art"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Ecommerce4Line = { id: string; name: string; variant: string; price: number; quantity: number; kind: ProductArtKind; tone: ProductArtTone }
type Ecommerce4Method = { id: string; label: string; detail: string; price: number }
type Ecommerce4Order = { email: string; name: string; address: string; city: string; postcode: string; country: string; method: string; cardLast4: string }

type Ecommerce4Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    lines?: Ecommerce4Line[]
    methods?: Ecommerce4Method[]
    currency?: string
    /** Called with the order. Resolve with an order number; reject with a message (for example "Your card was declined.") and nothing is charged. */
    onPlaceOrder?: (order: Ecommerce4Order) => string | void | Promise<string | void>
  }

const sampleLines: Ecommerce4Line[] = [
  { id: "1", name: "Aria portable speaker", variant: "Sand · With travel case", price: 129, quantity: 1, kind: "speaker", tone: 3 },
  { id: "2", name: "Ember ceramic mug", variant: "Clay", price: 28, quantity: 2, kind: "mug", tone: 4 },
]
const sampleMethods: Ecommerce4Method[] = [
  { id: "std", label: "Standard", detail: "2 to 4 working days", price: 0 },
  { id: "exp", label: "Express", detail: "Next working day if ordered before 2 pm", price: 14 },
]

const luhn = (n: string) => {
  const d = n.replace(/\D/g, "")
  if (d.length < 13) return false
  let sum = 0
  d.split("").reverse().forEach((c, i) => { let x = Number(c); if (i % 2) { x *= 2; if (x > 9) x -= 9 } sum += x })
  return sum % 10 === 0
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="grid gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

function Field({ id, label, error, hint, className, children }: { id: string; label: string; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

const input = "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"

/**
 * A three-step checkout on one page: contact, delivery, payment. Only the step you are on is open, finished steps fold into a summary with Edit, mistakes are
 * named next to the field they belong to (and focus goes to the first one), and a card that is declined says so and charges nothing.
 */
function Ecommerce4({ title = "Checkout", lines = sampleLines, methods = sampleMethods, currency = "USD", onPlaceOrder, state = "ready", onRetry, emptyState, errorState, className, ...props }: Ecommerce4Props) {
  const id = React.useId()
  const money = React.useMemo(() => { const f = new Intl.NumberFormat("en-US", { style: "currency", currency }); return (n: number) => f.format(n) }, [currency])
  const [step, setStep] = React.useState(0)
  const [done, setDone] = React.useState<number[]>([])
  const [v, setV] = React.useState({ email: "", news: false, name: "", address: "", city: "", postcode: "", country: "United States", method: methods[0]?.id ?? "", card: "", exp: "", cvc: "", holder: "" })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [paying, setPaying] = React.useState(false)
  const [failure, setFailure] = React.useState<string | null>(null)
  const [order, setOrder] = React.useState<string | null>(null)
  const panel = React.useRef<HTMLFormElement>(null)
  const set = (k: keyof typeof v, val: string | boolean) => { setV((o) => ({ ...o, [k]: val })); setErrors((e) => { if (!e[k]) return e; const { [k]: _, ...rest } = e; return rest }) }

  const method = methods.find((m) => m.id === v.method)
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  const total = subtotal + (method?.price ?? 0)
  const names = ["Contact", "Delivery", "Payment"]

  function validate(s: number) {
    const e: Record<string, string> = {}
    if (s === 0 && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter an email address like name@example.com."
    if (s === 1) {
      if (!v.name.trim()) e.name = "Enter the name of the person receiving it."
      if (!v.address.trim()) e.address = "Enter the street address."
      if (!v.city.trim()) e.city = "Enter the city."
      if (!v.postcode.trim()) e.postcode = "Enter the postal code."
    }
    if (s === 2) {
      if (!v.holder.trim()) e.holder = "Enter the name on the card."
      if (!luhn(v.card)) e.card = "That card number does not look right. Check the digits."
      const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v.exp)
      const now = new Date()
      const past = m ? 2000 + Number(m[2]) < now.getFullYear() || (2000 + Number(m[2]) === now.getFullYear() && Number(m[1]) < now.getMonth() + 1) : true
      if (!m || Number(m[1]) < 1 || Number(m[1]) > 12 || past) e.exp = "Enter a date that has not passed, like 08/29."
      if (!/^\d{3,4}$/.test(v.cvc)) e.cvc = "Enter the 3 or 4 digits on the card."
    }
    return e
  }
  function focusFirst(e: Record<string, string>) {
    const key = Object.keys(e)[0]
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>(`[data-field="${key}"]`)?.focus())
  }
  async function next(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(step)
    setErrors(errs)
    if (Object.keys(errs).length) return focusFirst(errs)
    if (step < 2) {
      setDone((d) => [...new Set([...d, step])])
      setStep(step + 1)
      return
    }
    setPaying(true)
    setFailure(null)
    try {
      const n = await (onPlaceOrder ? onPlaceOrder({ email: v.email, name: v.name, address: v.address, city: v.city, postcode: v.postcode, country: v.country, method: v.method, cardLast4: v.card.replace(/\D/g, "").slice(-4) }) : new Promise<string>((r) => setTimeout(() => r("BM-48213"), 900)))
      setOrder(n || "BM-48213")
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "The payment could not be completed. Nothing was charged.")
    } finally {
      setPaying(false)
    }
  }
  const view = state === "ready" && lines.length === 0 ? "empty" : state

  return (
    <section data-slot="ecommerce-4" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8"><h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em]">{title}</h1></header>
      <StateView state={view} onRetry={onRetry} label="Loading checkout" loading={<Skel />} empty={{ title: "Your bag is empty", description: "Add something before you check out.", ...emptyState }} error={{ title: "Checkout could not be loaded", description: "Nothing was charged. Check your connection and try again.", ...errorState }}>
        {order ? (
          <div role="status" className="mx-auto grid max-w-md justify-items-center gap-4 rounded-2xl border bg-card px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-foreground text-background"><CircleCheck aria-hidden="true" className="size-6" /></span>
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Thank you, {v.name.split(" ")[0] || "friend"}</h2>
            <p className="text-muted-foreground text-pretty">Order <span className="font-mono text-foreground">{order}</span> is confirmed. We have sent the details to {v.email}, and we will email you when it ships.</p>
            <p className="text-sm tabular-nums">Paid {money(total)} with the card ending {v.card.replace(/\D/g, "").slice(-4)}</p>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
            <ol className="grid min-w-0 gap-4">
              {names.map((n, i) => {
                const open = step === i
                const finished = done.includes(i) && !open
                return (
                  <li key={n} className={cn("rounded-xl border bg-card", !open && !finished && "opacity-60")}>
                    <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
                      <h2 className="flex items-center gap-3 text-base font-semibold">
                        <span aria-hidden="true" className={cn("flex size-6 items-center justify-center rounded-full border text-xs tabular-nums", finished ? "border-foreground bg-foreground text-background" : open ? "border-foreground" : "")}>{finished ? <Check className="size-3.5" /> : i + 1}</span>
                        {n}
                        {finished && <span className="sr-only">, done</span>}
                      </h2>
                      {finished && <button type="button" onClick={() => setStep(i)} aria-label={`Edit ${n.toLowerCase()}`} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"><Pencil aria-hidden="true" className="size-3.5" />Edit</button>}
                    </div>
                    {finished && (
                      <p className="px-5 pb-4 text-sm text-muted-foreground sm:px-6">
                        {i === 0 && v.email}
                        {i === 1 && `${v.name}, ${v.address}, ${v.city} ${v.postcode} · ${method?.label}${method?.price ? `, ${money(method.price)}` : ", free"}`}
                      </p>
                    )}
                    {open && (
                      <form ref={panel} noValidate onSubmit={(e) => void next(e)} className="grid gap-4 border-t px-5 py-5 sm:px-6">
                        {i === 0 && (
                          <>
                            <Field id={`${id}-email`} label="Email" error={errors.email} hint="For your receipt and delivery updates.">
                              <input id={`${id}-email`} data-field="email" type="email" autoComplete="email" inputMode="email" placeholder="name@example.com" value={v.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-err` : `${id}-email-hint`} className={input} />
                            </Field>
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm"><Checkbox checked={v.news} onCheckedChange={(c) => set("news", c === true)} />Send me news and offers, no more than twice a month</label>
                          </>
                        )}
                        {i === 1 && (
                          <>
                            <Field id={`${id}-name`} label="Full name" error={errors.name}><input id={`${id}-name`} data-field="name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-err` : undefined} className={input} /></Field>
                            <Field id={`${id}-address`} label="Address" error={errors.address}><input id={`${id}-address`} data-field="address" autoComplete="street-address" value={v.address} onChange={(e) => set("address", e.target.value)} aria-invalid={!!errors.address} aria-describedby={errors.address ? `${id}-address-err` : undefined} className={input} /></Field>
                            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
                              <Field id={`${id}-city`} label="City" error={errors.city}><input id={`${id}-city`} data-field="city" autoComplete="address-level2" value={v.city} onChange={(e) => set("city", e.target.value)} aria-invalid={!!errors.city} aria-describedby={errors.city ? `${id}-city-err` : undefined} className={input} /></Field>
                              <Field id={`${id}-postcode`} label="Postal code" error={errors.postcode}><input id={`${id}-postcode`} data-field="postcode" autoComplete="postal-code" value={v.postcode} onChange={(e) => set("postcode", e.target.value)} aria-invalid={!!errors.postcode} aria-describedby={errors.postcode ? `${id}-postcode-err` : undefined} className={input} /></Field>
                            </div>
                            <Field id={`${id}-country`} label="Country"><select id={`${id}-country`} autoComplete="country-name" value={v.country} onChange={(e) => set("country", e.target.value)} className={input}>{["United States", "Canada", "United Kingdom", "Germany", "France", "Australia"].map((c) => <option key={c}>{c}</option>)}</select></Field>
                            <fieldset className="grid gap-2">
                              <legend className="mb-1 text-sm font-medium">Delivery</legend>
                              {methods.map((m) => (
                                <label key={m.id} className="relative cursor-pointer">
                                  <input type="radio" name={`${id}-method`} checked={v.method === m.id} onChange={() => set("method", m.id)} className="peer sr-only" />
                                  <span className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors peer-checked:border-foreground peer-checked:bg-accent/50 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 motion-reduce:transition-none">
                                    <span><span className="block font-medium">{m.label}</span><span className="block text-xs text-muted-foreground">{m.detail}</span></span>
                                    <span className="font-medium tabular-nums">{m.price ? money(m.price) : "Free"}</span>
                                  </span>
                                </label>
                              ))}
                            </fieldset>
                          </>
                        )}
                        {i === 2 && (
                          <>
                            {failure && <p role="alert" className="rounded-lg border border-destructive/50 px-4 py-3 text-sm font-medium">{failure}</p>}
                            <Field id={`${id}-holder`} label="Name on card" error={errors.holder}><input id={`${id}-holder`} data-field="holder" autoComplete="cc-name" value={v.holder} onChange={(e) => set("holder", e.target.value)} aria-invalid={!!errors.holder} aria-describedby={errors.holder ? `${id}-holder-err` : undefined} className={input} /></Field>
                            <Field id={`${id}-card`} label="Card number" error={errors.card} hint="This demo accepts 4242 4242 4242 4242.">
                              <input id={`${id}-card`} data-field="card" autoComplete="cc-number" inputMode="numeric" value={v.card} onChange={(e) => set("card", e.target.value.replace(/[^\d ]/g, "").slice(0, 23))} aria-invalid={!!errors.card} aria-describedby={errors.card ? `${id}-card-err` : `${id}-card-hint`} placeholder="1234 1234 1234 1234" className={cn(input, "font-mono tabular-nums")} />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                              <Field id={`${id}-exp`} label="Expires" error={errors.exp}><input id={`${id}-exp`} data-field="exp" autoComplete="cc-exp" inputMode="numeric" placeholder="MM / YY" value={v.exp} onChange={(e) => set("exp", e.target.value.slice(0, 7))} aria-invalid={!!errors.exp} aria-describedby={errors.exp ? `${id}-exp-err` : undefined} className={cn(input, "font-mono tabular-nums")} /></Field>
                              <Field id={`${id}-cvc`} label="Security code" error={errors.cvc}><input id={`${id}-cvc`} data-field="cvc" autoComplete="cc-csc" inputMode="numeric" value={v.cvc} onChange={(e) => set("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))} aria-invalid={!!errors.cvc} aria-describedby={errors.cvc ? `${id}-cvc-err` : undefined} className={cn(input, "font-mono tabular-nums")} /></Field>
                            </div>
                          </>
                        )}
                        <Button type="submit" size="lg" loading={paying && i === 2} className="mt-1 h-12 w-full text-base sm:w-fit sm:min-w-52">
                          {i === 2 ? <><Lock aria-hidden="true" className="size-4" /> Pay {money(total)}</> : "Continue"}
                        </Button>
                      </form>
                    )}
                  </li>
                )
              })}
            </ol>
            <aside aria-labelledby={`${id}-sum`} className="grid gap-5 rounded-xl border bg-card p-5 sm:p-6 lg:sticky lg:top-6">
              <h2 id={`${id}-sum`} className="text-base font-semibold">In your bag</h2>
              <ul className="grid gap-4">
                {lines.map((l) => (
                  <li key={l.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3">
                    <span className="relative"><ProductArt kind={l.kind} tone={l.tone} className="rounded-lg" /><span className="absolute -end-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] font-medium text-background tabular-nums"><span className="sr-only">Quantity </span>{l.quantity}</span></span>
                    <span className="min-w-0 text-sm"><span className="block truncate font-medium">{l.name}</span><span className="block truncate text-xs text-muted-foreground">{l.variant}</span></span>
                    <span className="text-sm tabular-nums">{money(l.price * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="grid gap-2.5 border-t pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="tabular-nums">{method?.price ? money(method.price) : "Free"}</dd></div>
                <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
              </dl>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock aria-hidden="true" className="size-3 shrink-0" />Card details are sent securely and never stored on this page.</p>
            </aside>
          </div>
        )}
      </StateView>
    </section>
  )
}

export { Ecommerce4, type Ecommerce4Line, type Ecommerce4Method, type Ecommerce4Order, type Ecommerce4Props }
