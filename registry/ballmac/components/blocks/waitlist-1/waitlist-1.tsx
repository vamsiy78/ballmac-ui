// Ballmac UI: Waitlist 1. https://ui.ballmac.com/blocks/waitlist-1
"use client"

import * as React from "react"
import { ArrowRight, CircleAlert, Gift, Loader2, Lock, Mail, Share2 } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CopyButton } from "@/components/ballmac/copy-button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Input } from "@/components/ballmac/input"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { formPhase, type FormStateProps } from "@/lib/ballmac/use-resource"
import { cn } from "@/lib/utils"

type Waitlist1Joined = { /** Their place in line, 1 is first. */ position: number; /** Their share link. */ link: string; /** How many friends have joined from it. */ referrals: number }

type Waitlist1Reward = { /** Friends needed. */ at: number; title: string; description?: string }

type Waitlist1Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> &
  FormStateProps & {
    product?: string
    title?: string
    description?: string
    /** How many people are waiting, shown under the form. */
    waiting?: number
    rewards?: Waitlist1Reward[]
    /** Names for the little faces beside the count. */
    faces?: string[]
    /** Called with the email. Return where they stand; reject to show a message and keep what they typed. */
    onJoin?: (email: string) => Promise<Waitlist1Joined> | Waitlist1Joined
    /** Start already joined, for showing the second screen. */
    defaultJoined?: Waitlist1Joined
  }

const sampleRewards: Waitlist1Reward[] = [
  { at: 1, title: "Skip ahead 100 places", description: "For your first friend" },
  { at: 3, title: "Early access", description: "In the first wave of invites" },
  { at: 10, title: "A year free", description: "On any plan" },
]

const names = ["Mara E", "Theo N", "Priya S", "Noor H", "Kofi M"]

/**
 * A launch waitlist that grows by referral. First the email form and how many are waiting; once joined, the person sees their place in line,
 * their own share link, and a ladder of rewards that fills as friends join. The place counts up, the link copies with one press, and a
 * failed join keeps what was typed.
 */
function Waitlist1({
  product = "Acme",
  title,
  description = "We let people in a few at a time so every one gets our full attention. Join the list, and move up by bringing friends.",
  waiting = 2431,
  rewards = sampleRewards,
  faces = names,
  onJoin,
  defaultJoined,
  state: stateProp,
  errorState,
  className,
  ...props
}: Waitlist1Props) {
  const id = React.useId()
  const [email, setEmail] = React.useState("")
  const [invalid, setInvalid] = React.useState<string>()
  const [internal, setInternal] = React.useState<"idle" | "sending" | "done" | "error">(defaultJoined ? "done" : "idle")
  const [joined, setJoined] = React.useState<Waitlist1Joined | undefined>(defaultJoined)
  const [message, setMessage] = React.useState<string>()
  const state = formPhase(stateProp) ?? internal
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const first = React.useRef(true)
  const done = state === "done"
  const sending = state === "sending"
  const info = joined ?? { position: 1284, link: "acme.com/r/mara-7k2", referrals: 1 }

  React.useEffect(() => {
    if (first.current) first.current = false
    else if (done) headingRef.current?.focus()
  }, [done])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setInvalid("Enter an email address like name@company.com.")
    setInvalid(undefined)
    setMessage(undefined)
    setInternal("sending")
    try {
      if (onJoin) setJoined(await onJoin(email.trim()))
      else {
        await new Promise((r) => setTimeout(r, 800))
        setJoined({ position: waiting + 1, link: "acme.com/r/you-7k2", referrals: 0 })
      }
      setInternal("done")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : undefined)
      setInternal("error")
    }
  }

  const next = rewards.find((r) => r.at > info.referrals)
  const shareText = encodeURIComponent(`I just joined the ${product} waitlist. Join with my link and we both move up:`)

  return (
    <section data-slot="waitlist-1" aria-labelledby={`${id}-h`} aria-busy={sending} className={cn("relative isolate w-full overflow-hidden", className)} {...props}>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-80 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]">
        <CoverArt seed={`${product}-waitlist`} variant="mesh" className="absolute inset-0" />
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      {!done ? (
        <div className="text-center">
          <p className="bg-background/70 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium backdrop-blur">
            <Lock aria-hidden="true" className="size-3.5" />
            Invite only for now
          </p>
          <h2 id={`${id}-h`} ref={headingRef} tabIndex={-1} className="mx-auto mt-6 max-w-xl text-5xl font-semibold tracking-[-0.045em] text-balance outline-none sm:text-6xl">
            {title ?? `Be first in line for ${product}`}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty">{description}</p>

          <form onSubmit={submit} noValidate className="mx-auto mt-10 max-w-md">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="flex-1 text-start">
                <Input type="email" size="lg" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" placeholder="you@company.com" autoComplete="email" disabled={sending} aria-invalid={!!invalid} aria-describedby={invalid ? `${id}-err` : undefined} />
              </div>
              <Button type="submit" size="lg" disabled={sending}>
                {sending ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : null}
                {sending ? "Joining" : "Join the waitlist"}
                {sending ? null : <ArrowRight aria-hidden="true" className="rtl:rotate-180" />}
              </Button>
            </div>
            {invalid ? (
              <p id={`${id}-err`} role="alert" className="text-destructive mt-3 text-start text-sm">
                {invalid}
              </p>
            ) : null}
            {state === "error" ? (
              <p role="alert" className="text-destructive mt-3 flex items-start gap-2 text-start text-sm">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {errorState?.description ?? message ?? "We could not add you just now. Your email is still here, so try again."}
              </p>
            ) : null}
          </form>

          <div className="mt-8 flex items-center justify-center gap-3">
            <ul aria-hidden="true" className="flex -space-x-2">
              {faces.map((f) => (
                <li key={f} className="border-background relative flex size-8 items-center justify-center overflow-hidden rounded-full border-2 text-[10px] font-semibold">
                  <CoverArt seed={f} variant="mesh" className="absolute inset-0" />
                  <span className="relative">{f[0]}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-semibold tabular-nums">{new Intl.NumberFormat("en").format(waiting)}</span> people are waiting
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center" role="status">
            <p className="text-muted-foreground text-sm font-medium">You are on the list</p>
            <h2 id={`${id}-h`} ref={headingRef} tabIndex={-1} className="mt-3 text-6xl font-semibold tracking-[-0.05em] outline-none sm:text-8xl">
              <span aria-hidden="true">
                #<NumberTicker value={info.position} />
              </span>
              <span className="sr-only">Number {new Intl.NumberFormat("en").format(info.position)}</span>
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-pretty">
              in line for {product}. {next ? `Bring ${next.at - info.referrals} more ${next.at - info.referrals === 1 ? "friend" : "friends"} and you unlock ${next.title.toLowerCase()}.` : "You have unlocked every reward. Thank you for spreading the word."}
            </p>
          </div>

          <div className="bg-card mt-10 rounded-3xl border p-5 sm:p-7">
            <h3 className="flex items-center gap-2 font-semibold tracking-tight">
              <Share2 aria-hidden="true" className="size-4" />
              Your link
            </h3>
            <div className="mt-3 flex items-center gap-2 rounded-xl border p-1.5 ps-4">
              <p className="min-w-0 flex-1 truncate font-mono text-sm" dir="ltr">
                {info.link}
              </p>
              <CopyButton value={`https://${info.link}`} label="Copy link" copiedLabel="Copied" variant="solid" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`mailto:?subject=${encodeURIComponent(`Join me on the ${product} waitlist`)}&body=${shareText}%20https://${info.link}`} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-md border px-3.5 text-sm font-medium outline-none focus-visible:ring-[3px]">
                <Mail aria-hidden="true" className="size-4" />
                Email a friend
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=https://${info.link}`} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 rounded-md border px-3.5 text-sm font-medium outline-none focus-visible:ring-[3px]" rel="noreferrer" target="_blank">
                Post on X<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>

          <div className="bg-card mt-5 rounded-3xl border p-5 sm:p-7">
            <h3 className="flex items-center gap-2 font-semibold tracking-tight">
              <Gift aria-hidden="true" className="size-4" />
              Rewards <span className="text-muted-foreground font-normal tabular-nums">· {info.referrals} {info.referrals === 1 ? "friend" : "friends"} joined</span>
            </h3>
            <ol className="mt-5 grid gap-0">
              {rewards.map((r, i) => {
                const got = info.referrals >= r.at
                const last = i === rewards.length - 1
                return (
                  <li key={r.at} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last ? <span aria-hidden="true" className={cn("absolute start-[15px] top-8 -bottom-0 w-px", got ? "bg-foreground" : "bg-border")} /> : null}
                    <span aria-hidden="true" className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-colors motion-reduce:transition-none", got ? "bg-foreground text-background border-foreground" : "bg-background")}>
                      {got ? "✓" : r.at}
                    </span>
                    <div className="min-w-0 pt-1">
                      <p className="text-sm font-medium">
                        {r.title}
                        <span className="sr-only">, {got ? "unlocked" : `needs ${r.at - info.referrals} more ${r.at - info.referrals === 1 ? "friend" : "friends"}`}</span>
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {r.description ? `${r.description} · ` : ""}
                        {r.at} {r.at === 1 ? "friend" : "friends"}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      )}
      </div>
    </section>
  )
}

export { Waitlist1, type Waitlist1Props, type Waitlist1Joined, type Waitlist1Reward }
