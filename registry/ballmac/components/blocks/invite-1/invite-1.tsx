// Ballmac UI: Invite 1. https://ui.ballmac.com/blocks/invite-1
"use client"

import * as React from "react"
import { ArrowRight, Check, Clock, Users } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { cn } from "@/lib/utils"

type Invite1Status = "pending" | "expired"

type Invite1Props = Omit<React.ComponentProps<"section">, "onSubmit"> & {
  /** Whether the invitation can still be accepted. */
  status?: Invite1Status
  /** The workspace being joined. */
  workspace?: { name: string; members?: number; color?: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" }
  /** Who sent the invitation. */
  inviter?: { name: string; role?: string }
  /** The role being offered. */
  role?: string
  /** The address the invitation was sent to; shown as the account being used. */
  email?: string
  /** What the role can do. Shown as a checked list. */
  access?: string[]
  /** Called by "Accept invitation". Throw to show an error; resolve to show the welcome screen. */
  onAccept?: () => void | Promise<void>
  /** Called by "Decline". Pass null to hide the button. */
  onDecline?: (() => void | Promise<void>) | null
  /** Called by "Request a new invitation" on an expired invitation. */
  onRequestNew?: () => void | Promise<void>
  /** Called by "Not you? Switch account". Pass null to hide it. */
  onSwitchAccount?: (() => void) | null
  /** Where "Open workspace" goes after accepting. */
  continueHref?: string
}

const tiles = { "chart-1": "bg-chart-1", "chart-2": "bg-chart-2", "chart-3": "bg-chart-3", "chart-4": "bg-chart-4", "chart-5": "bg-chart-5" }

function Invite1({
  status = "pending",
  workspace = { name: "Northwind Studio", members: 24, color: "chart-1" },
  inviter = { name: "Maya Kim", role: "Head of Finance" },
  role = "Editor",
  email = "jordan@acme.com",
  access = ["View and edit invoices and reports", "Comment and mention teammates", "Invite guests to specific items"],
  onAccept,
  onDecline = () => {},
  onRequestNew,
  onSwitchAccount = () => {},
  continueHref = "#",
  className,
  ...props
}: Invite1Props) {
  const [view, setView] = React.useState<"idle" | "accepted" | "declined" | "requested">("idle")
  const [busy, setBusy] = React.useState<"accept" | "decline" | "request" | null>(null)
  const [failed, setFailed] = React.useState(false)
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
  }, [view])

  const tone = tiles[workspace.color ?? "chart-1"]
  const initial = workspace.name[0]?.toUpperCase() ?? "W"
  const expired = status === "expired"

  async function run(kind: "accept" | "decline" | "request", fn: (() => void | Promise<void>) | null | undefined, next: typeof view) {
    setBusy(kind)
    setFailed(false)
    try {
      if (fn) await fn()
      else await new Promise((r) => setTimeout(r, 700))
      setView(next)
    } catch {
      setFailed(true)
    } finally {
      setBusy(null)
    }
  }

  const heading = "text-2xl font-semibold tracking-[-0.03em] text-balance outline-none sm:text-3xl"
  return (
    <section data-slot="invite-1" className={cn("flex min-h-[38rem] items-center justify-center px-4 py-14", className)} {...props}>
      <div className="bg-card relative w-full max-w-md overflow-hidden rounded-3xl border p-7 text-center shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)] sm:p-9">
        <div aria-hidden="true" className={cn("absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full opacity-20 blur-[70px]", tone)} />

        {view === "accepted" ? (
          <div className="relative flex flex-col items-center py-4">
            <span aria-hidden="true" className="bg-chart-2/15 flex size-14 items-center justify-center rounded-full"><Check className="size-7" /></span>
            <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-6")}>Welcome to {workspace.name}</h1>
            <p role="status" className="text-muted-foreground mt-2 text-pretty">You joined with the {role} role. {inviter.name} and the team are glad you’re here.</p>
            <a href={continueHref} className={buttonVariants({ size: "lg", shape: "pill", className: "mt-8 w-full" })}>Open workspace <ArrowRight /></a>
          </div>
        ) : view === "declined" ? (
          <div className="relative flex flex-col items-center py-4">
            <h1 ref={headingRef} tabIndex={-1} className={heading}>Invitation declined</h1>
            <p role="status" className="text-muted-foreground mt-2 text-pretty">We’ve let {inviter.name} know. You can close this page.</p>
            <Button variant="ghost" className="mt-6" onClick={() => setView("idle")}>Changed your mind? Go back</Button>
          </div>
        ) : view === "requested" ? (
          <div className="relative flex flex-col items-center py-4">
            <span aria-hidden="true" className="bg-chart-2/15 flex size-14 items-center justify-center rounded-full"><Check className="size-7" /></span>
            <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-6")}>Request sent</h1>
            <p role="status" className="text-muted-foreground mt-2 text-pretty">We’ve asked {inviter.name} to send you a new invitation. Check {email} soon.</p>
          </div>
        ) : expired ? (
          <div className="relative flex flex-col items-center">
            <span aria-hidden="true" className="bg-muted flex size-14 items-center justify-center rounded-2xl"><Clock className="size-7" /></span>
            <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-6")}>This invitation has expired</h1>
            <p className="text-muted-foreground mt-2 text-pretty">Invitations to {workspace.name} are valid for 7 days. Ask {inviter.name} to send a new one, or request it now.</p>
            {failed && <p role="alert" className="text-destructive mt-4 text-sm">We couldn’t send the request. Please try again.</p>}
            <Button size="lg" shape="pill" loading={busy === "request"} className="mt-8 w-full" onClick={() => run("request", onRequestNew, "requested")}>Request a new invitation</Button>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-center">
              <span aria-hidden="true" className={cn("text-background flex size-16 items-center justify-center rounded-2xl text-2xl font-bold shadow-lg", tone)}>{initial}</span>
            </div>
            <p className="text-muted-foreground mt-6 text-sm"><span className="text-foreground font-medium">{inviter.name}</span>{inviter.role ? ` (${inviter.role})` : ""} invited you to join</p>
            <h1 ref={headingRef} tabIndex={-1} className={cn(heading, "mt-1")}>{workspace.name}</h1>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline">Role: {role}</Badge>
              {workspace.members ? <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm"><Users className="size-4" aria-hidden="true" />{workspace.members} members</span> : null}
            </div>

            {access.length > 0 && (
              <ul className="bg-muted/40 mt-7 space-y-2.5 rounded-2xl border p-4 text-left text-sm">
                {access.map((a) => (
                  <li key={a} className="flex items-start gap-2.5">
                    <Check className="text-chart-2 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            )}

            <p className="text-muted-foreground mt-6 text-sm">
              Joining as <span className="text-foreground font-medium break-all">{email}</span>
              {onSwitchAccount && (
                <>
                  {" · "}
                  <button type="button" onClick={onSwitchAccount} className="text-foreground focus-visible:ring-ring/50 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">Not you?</button>
                </>
              )}
            </p>

            {failed && <p role="alert" className="text-destructive mt-4 text-sm">We couldn’t complete that. Please try again.</p>}
            <div className="mt-6 grid gap-2">
              <Button size="lg" shape="pill" loading={busy === "accept"} disabled={busy === "decline"} onClick={() => run("accept", onAccept, "accepted")}>Accept invitation</Button>
              {onDecline && (
                <Button variant="ghost" loading={busy === "decline"} disabled={busy === "accept"} onClick={() => run("decline", onDecline, "declined")}>Decline</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export { Invite1, type Invite1Props, type Invite1Status }
