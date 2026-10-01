// Ballmac UI: Onboarding 1. https://ui.ballmac.com/blocks/onboarding-1
"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, Plus, Rocket, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Button, buttonVariants } from "@/components/ballmac/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, useFieldControl } from "@/components/ballmac/field"
import { Input } from "@/components/ballmac/input"
import { cn } from "@/lib/utils"

type Onboarding1Goal = { id: string; title: string; description: string; icon?: React.ReactNode }

type Onboarding1Values = { name: string; slug: string; color: string; goals: string[]; invites: string[] }

type Onboarding1Props = Omit<React.ComponentProps<"section">, "onSubmit"> & {
  /** Product name used in the copy and the web address prefix. */
  product?: string
  /** Domain shown before the workspace address. */
  domain?: string
  /** What people can pick on the second step. */
  goals?: Onboarding1Goal[]
  /** Called with the answers when the last step is confirmed. Throw to show an error; resolve to show the finish screen. */
  onComplete?: (values: Onboarding1Values) => void | Promise<void>
  /** Where the final button goes. */
  continueHref?: string
}

const colors = [
  { id: "chart-1", label: "Blue", cls: "bg-chart-1" },
  { id: "chart-3", label: "Amber", cls: "bg-chart-3" },
  { id: "chart-5", label: "Violet", cls: "bg-chart-5" },
  { id: "chart-2", label: "Green", cls: "bg-chart-2" },
  { id: "chart-4", label: "Coral", cls: "bg-chart-4" },
]

const defaultGoals: Onboarding1Goal[] = [
  { id: "invoicing", title: "Send invoices", description: "Bill customers and get paid faster" },
  { id: "expenses", title: "Track expenses", description: "Receipts, cards and approvals" },
  { id: "reporting", title: "Build reports", description: "Revenue, cash flow and trends" },
  { id: "payroll", title: "Run payroll", description: "Pay your team on time, every time" },
]

const stepNames = ["Workspace", "Your goals", "Your team", "All set"]
const emailPattern = /^\S+@\S+\.\S+$/
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

function FieldInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...useFieldControl()} {...props} />
}

function Onboarding1({
  product = "Acme",
  domain = "app.acme.com",
  goals = defaultGoals,
  onComplete,
  continueHref = "#",
  className,
  ...props
}: Onboarding1Props) {
  const reduce = useReducedMotion()
  const [step, setStep] = React.useState(0)
  const [dir, setDir] = React.useState(1)
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [slugEdited, setSlugEdited] = React.useState(false)
  const [color, setColor] = React.useState("chart-1")
  const [picked, setPicked] = React.useState<string[]>([])
  const [invites, setInvites] = React.useState<string[]>([])
  const [draft, setDraft] = React.useState("")
  const [draftError, setDraftError] = React.useState<string>()
  const [tried, setTried] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  // The heading mounts only after the previous step has animated out, so focus it as it mounts (not on first load).
  const ready = React.useRef(false)
  React.useEffect(() => {
    ready.current = true
  }, [])
  const headingRef = React.useCallback((node: HTMLHeadingElement | null) => {
    if (node && ready.current) node.focus()
  }, [])

  const nameError = tried && !name.trim() ? "Give your workspace a name." : undefined
  const slugError = tried && !slug ? "Choose a web address." : undefined
  const goalError = tried && picked.length === 0 ? "Choose at least one." : undefined

  function go(next: number) {
    setDir(next > step ? 1 : -1)
    setTried(false)
    setStep(next)
  }

  function addInvite() {
    const value = draft.trim().replace(/,$/, "")
    if (!value) return true
    if (!emailPattern.test(value)) {
      setDraftError("Enter a full email address.")
      return false
    }
    if (invites.includes(value)) {
      setDraftError("Already on the list.")
      return false
    }
    setInvites((i) => [...i, value])
    setDraft("")
    setDraftError(undefined)
    return true
  }

  async function next() {
    if (step === 0) {
      setTried(true)
      if (!name.trim() || !slug) return
      go(1)
    } else if (step === 1) {
      setTried(true)
      if (picked.length === 0) return
      go(2)
    } else if (step === 2) {
      if (!addInvite()) return
      go(3)
    } else if (step === 3) {
      setBusy(true)
      setFailed(false)
      try {
        const values = { name: name.trim(), slug, color, goals: picked, invites }
        if (onComplete) await onComplete(values)
        else await new Promise((r) => setTimeout(r, 900))
        setStep(4)
        setDir(1)
      } catch {
        setFailed(true)
      } finally {
        setBusy(false)
      }
    }
  }

  const done = step === 4
  const slide = reduce ? {} : { initial: { opacity: 0, x: dir * 28 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: dir * -28 } }
  const swatch = colors.find((c) => c.id === color) ?? colors[0]
  const heading = "text-2xl font-semibold tracking-[-0.03em] outline-none sm:text-3xl"

  return (
    <section data-slot="onboarding-1" className={cn("mx-auto flex min-h-[40rem] max-w-5xl items-center px-4 py-12 sm:px-6", className)} {...props}>
      <div className="bg-card grid w-full overflow-hidden rounded-3xl border shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)] md:grid-cols-[15rem_1fr]">
        {/* Progress: a rail on tablets and up, a compact bar on phones. */}
        <div className="bg-muted/40 border-b p-5 md:border-r md:border-b-0 md:p-8">
          <p className="text-sm font-semibold tracking-tight">{product}</p>
          <p className="text-muted-foreground mt-4 text-xs md:hidden">{done ? "Complete" : `Step ${step + 1} of ${stepNames.length}`}: {stepNames[Math.min(step, 3)]}</p>
          <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full md:hidden" aria-hidden="true">
            <div className="bg-foreground h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${((done ? 4 : step + 1) / 4) * 100}%` }} />
          </div>
          <ol aria-label="Setup progress" className="mt-8 hidden space-y-1 md:block">
            {stepNames.map((n, i) => {
              const complete = done || i < step
              const current = !done && i === step
              return (
                <li key={n} aria-current={current ? "step" : undefined} className={cn("flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm", current ? "bg-background font-medium shadow-xs ring-1 ring-border" : "text-muted-foreground")}>
                  <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums", complete && "bg-foreground text-background border-transparent", current && "border-foreground")}>
                    {complete ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                  </span>
                  {n}
                  {complete && <span className="sr-only"> (done)</span>}
                </li>
              )
            })}
          </ol>
        </div>

        <div className="flex min-h-[32rem] min-w-0 flex-col p-6 sm:p-10">
          <div className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} {...slide} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                {step === 0 && (
                  <>
                    <h1 ref={headingRef} tabIndex={-1} className={heading}>Name your workspace</h1>
                    <p className="text-muted-foreground mt-2 text-pretty">This is where your team’s work lives. You can change it later.</p>
                    <FieldGroup className="mt-8">
                      <Field invalid={!!nameError}>
                        <FieldLabel required>Workspace name</FieldLabel>
                        <FieldInput
                          autoComplete="organization"
                          placeholder="Northwind Studio"
                          value={name}
                          onChange={(e) => { setName(e.target.value); if (!slugEdited) setSlug(slugify(e.target.value)) }}
                        />
                        <FieldError errors={[nameError]} />
                      </Field>
                      <Field invalid={!!slugError}>
                        <FieldLabel required>Web address</FieldLabel>
                        <div className="flex">
                          <span className="bg-muted text-muted-foreground flex items-center rounded-l-md border border-r-0 px-3 text-sm">{domain}/</span>
                          <FieldInput className="rounded-l-none" autoCapitalize="none" spellCheck={false} placeholder="northwind" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true) }} />
                        </div>
                        <FieldError errors={[slugError]} />
                      </Field>
                      <fieldset>
                        <legend className="mb-2 text-sm font-medium">Workspace color</legend>
                        <div className="flex gap-2.5">
                          {colors.map((c) => (
                            <label key={c.id} className="relative cursor-pointer">
                              <input type="radio" name="onboarding-color" value={c.id} checked={color === c.id} onChange={() => setColor(c.id)} className="peer sr-only" />
                              <span className={cn("peer-focus-visible:ring-ring/50 peer-checked:ring-foreground ring-offset-card flex size-9 items-center justify-center rounded-full ring-2 ring-transparent ring-offset-2 transition-shadow peer-focus-visible:ring-[3px]", c.cls)}>
                                {color === c.id && <Check className="text-background size-4" aria-hidden="true" />}
                              </span>
                              <span className="sr-only">{c.label}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </FieldGroup>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h1 ref={headingRef} tabIndex={-1} className={heading}>What will you use {product} for?</h1>
                    <p className="text-muted-foreground mt-2 text-pretty">Pick everything that applies. We’ll set up the right things first.</p>
                    <fieldset className="mt-8">
                      <legend className="sr-only">Your goals</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {goals.map((g) => {
                          const on = picked.includes(g.id)
                          return (
                            <label key={g.id} className="relative cursor-pointer">
                              <input type="checkbox" checked={on} onChange={() => setPicked((p) => (on ? p.filter((x) => x !== g.id) : [...p, g.id]))} className="peer sr-only" />
                              <span className="peer-focus-visible:ring-ring/50 peer-checked:border-foreground peer-checked:bg-accent/60 hover:bg-accent/40 flex h-full items-start gap-3 rounded-2xl border p-4 transition-colors peer-focus-visible:ring-[3px]">
                                <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border", on && "bg-foreground text-background border-transparent")}>
                                  {on && <Check className="size-3.5" aria-hidden="true" />}
                                </span>
                                <span>
                                  <span className="block text-sm font-medium">{g.title}</span>
                                  <span className="text-muted-foreground block text-sm">{g.description}</span>
                                </span>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                      {goalError && <p role="alert" className="text-destructive mt-3 text-sm">{goalError}</p>}
                    </fieldset>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h1 ref={headingRef} tabIndex={-1} className={heading}>Invite your team</h1>
                    <p className="text-muted-foreground mt-2 text-pretty">Add teammates by email. They’ll get an invitation to join {name.trim() || "your workspace"}. You can skip this.</p>
                    <FieldGroup className="mt-8">
                      <Field invalid={!!draftError}>
                        <FieldLabel>Email addresses</FieldLabel>
                        <div className="flex gap-2">
                          <FieldInput
                            type="email"
                            placeholder="teammate@company.com"
                            value={draft}
                            onChange={(e) => { setDraft(e.target.value); setDraftError(undefined) }}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addInvite() } }}
                          />
                          <Button type="button" variant="outline" onClick={addInvite}><Plus /> Add</Button>
                        </div>
                        <FieldError errors={[draftError]} />
                        {!draftError && <FieldDescription>Press Enter to add each address.</FieldDescription>}
                      </Field>
                    </FieldGroup>
                    {invites.length > 0 && (
                      <ul aria-label="People to invite" className="mt-5 flex flex-wrap gap-2">
                        {invites.map((e) => (
                          <li key={e} className="bg-secondary flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm">
                            {e}
                            <button type="button" aria-label={`Remove ${e}`} onClick={() => setInvites((i) => i.filter((x) => x !== e))} className="hover:bg-background focus-visible:ring-ring/50 flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-[3px]">
                              <X className="size-3.5" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {step === 3 && (
                  <>
                    <h1 ref={headingRef} tabIndex={-1} className={heading}>Ready to go?</h1>
                    <p className="text-muted-foreground mt-2 text-pretty">Here’s what we’ll create. You can change any of it later.</p>
                    <dl className="mt-8 divide-y rounded-2xl border">
                      <div className="flex items-center justify-between gap-4 p-4">
                        <dt className="text-muted-foreground text-sm">Workspace</dt>
                        <dd className="flex items-center gap-2.5 text-sm font-medium">
                          <span aria-hidden="true" className={cn("text-background flex size-6 items-center justify-center rounded-md text-xs font-bold", swatch.cls)}>{(name.trim()[0] ?? "W").toUpperCase()}</span>
                          {name.trim()}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 p-4">
                        <dt className="text-muted-foreground text-sm">Address</dt>
                        <dd className="min-w-0 truncate font-mono text-sm">{domain}/{slug}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 p-4">
                        <dt className="text-muted-foreground text-sm">Goals</dt>
                        <dd className="text-right text-sm font-medium">{picked.map((id) => goals.find((g) => g.id === id)?.title).join(", ")}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 p-4">
                        <dt className="text-muted-foreground text-sm">Invitations</dt>
                        <dd className="text-sm font-medium">{invites.length ? `${invites.length} ${invites.length === 1 ? "person" : "people"}` : "None yet"}</dd>
                      </div>
                    </dl>
                    {failed && <p role="alert" className="text-destructive mt-4 text-sm">We couldn’t create the workspace. Please try again.</p>}
                  </>
                )}

                {done && (
                  <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
                    <span aria-hidden="true" className={cn("text-background flex size-16 items-center justify-center rounded-2xl", swatch.cls)}><Rocket className="size-8" /></span>
                    <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-6")}>{name.trim()} is ready</h1>
                    <p role="status" className="text-muted-foreground mt-2 max-w-sm text-pretty">
                      Your workspace is set up{invites.length ? ` and ${invites.length} ${invites.length === 1 ? "invitation is" : "invitations are"} on the way` : ""}. Let’s get to work.
                    </p>
                    <a href={continueHref} className={buttonVariants({ size: "lg", shape: "pill", className: "mt-8" })}>
                      Open your workspace <ArrowRight />
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {!done && (
            <div className="mt-10 flex items-center justify-between gap-3">
              {step > 0 ? <Button variant="ghost" onClick={() => go(step - 1)}><ArrowLeft /> Back</Button> : <span />}
              <div className="flex items-center gap-2">
                {step === 2 && <Button variant="ghost" onClick={() => go(3)}>Skip for now</Button>}
                <Button shape="pill" size="lg" loading={busy} onClick={next}>
                  {step === 3 ? "Create workspace" : "Continue"} {step < 3 && <ArrowRight />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export { Onboarding1, type Onboarding1Props, type Onboarding1Values, type Onboarding1Goal }
