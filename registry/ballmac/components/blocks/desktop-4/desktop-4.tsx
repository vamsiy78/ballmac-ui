// Ballmac UI: Desktop 4. https://ui.ballmac.com/blocks/desktop-4
"use client"

import * as React from "react"
import { BadgeCheck, CircleAlert, KeyRound, Loader2, Sparkles } from "lucide-react"

import { AppWindow, AppWindowContent, AppWindowTitleBar } from "@/components/ballmac/app-window"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Progress } from "@/components/ballmac/progress"
import { frameProps } from "@/components/ballmac/state-view"
import { useFeel, type FeelId } from "@/lib/ballmac/feel"
import { formPhase, type FormStateProps } from "@/lib/ballmac/use-resource"
import { cn } from "@/lib/utils"

type Desktop4Licence = {
  /** Who the licence belongs to, usually the buyer's email. */
  licensedTo: string
  /** The plan name, for example "Pro". */
  plan?: string
}

type Desktop4Props = Omit<React.ComponentProps<"div">, "children" | "onSubmit"> &
  FormStateProps & {
    /** Which platform the window handles like. Defaults to the page's feel. */
    feel?: FeelId
    /** Draw the window frame. Turn off inside a real Tauri or Electron window that already has one. */
    frame?: boolean
    appName?: string
    /** The app icon. A generated one is drawn when you leave it out. */
    icon?: React.ReactNode
    /** Days left in the trial. 0 means the trial has ended. */
    trialDaysLeft?: number
    /** The length of the trial in days, for the meter. */
    trialLength?: number
    /** Where "Buy a licence" goes. */
    buyUrl?: string
    /** One line about seats, for example "One licence works on up to 3 Macs." */
    seatsNote?: string
    /** An active licence. Pass it and the window opens on the licensed view. */
    licence?: Desktop4Licence
    /**
     * Called with the trimmed key. Resolve with the licence to show who it belongs to; throw an Error to show its message under the
     * field. Defaults to a simulated check that accepts any key of 16 or more characters.
     */
    onActivate?: (key: string) => Desktop4Licence | void | Promise<Desktop4Licence | void>
    /** Called by "Continue trial". Not shown once the trial has ended. */
    onContinueTrial?: () => void
    /** Called by "Quit" once the trial has ended. */
    onQuit?: () => void
    /** Called by "Deactivate" in the licensed view, to free the seat. */
    onDeactivate?: () => void | Promise<void>
    /** Called by Done in the licensed view, and by the close button. */
    onDone?: () => void
  }

function AppIcon({ icon, className }: { icon?: React.ReactNode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "from-primary to-primary/70 text-primary-foreground flex shrink-0 items-center justify-center rounded-[22%] bg-linear-to-b shadow-[0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.25)] [&_svg]:size-1/2",
        className
      )}
    >
      {icon ?? <Sparkles />}
    </span>
  )
}

function Actions({ feel, start, children }: { feel: FeelId; start?: React.ReactNode; children: React.ReactNode[] }) {
  const ordered = feel === "windows" ? [...children].reverse() : children
  return (
    <div data-slot="desktop-4-actions" className="flex flex-wrap items-center gap-2">
      {start}
      <div className="ms-auto flex flex-wrap justify-end gap-2">{ordered}</div>
    </div>
  )
}

/**
 * Licence activation for a paid desktop app: the trial meter, a key field that accepts a pasted key with spaces or line breaks,
 * activation with the reason when it fails, and the licensed view with deactivate. Wording follows the platform ("this Mac",
 * "this PC") and its button order.
 */
function Desktop4({
  feel: feelProp,
  frame = true,
  appName = "Acme",
  icon,
  trialDaysLeft = 9,
  trialLength = 14,
  buyUrl = "#",
  seatsNote,
  licence: licenceProp,
  onActivate,
  onContinueTrial,
  onQuit,
  onDeactivate,
  onDone,
  state: stateProp,
  errorState,
  className,
  ...props
}: Desktop4Props) {
  const page = useFeel().feel
  const feel = feelProp ?? page
  const win = feel === "windows"
  const mac = feel === "macos"
  const device = mac ? "this Mac" : win ? "this PC" : "this device"
  const id = React.useId()
  const [key, setKey] = React.useState("")
  const [licence, setLicence] = React.useState<Desktop4Licence | undefined>(licenceProp)
  React.useEffect(() => setLicence(licenceProp), [licenceProp])
  const [phase, setPhase] = React.useState<"idle" | "sending" | "error" | "done">(licenceProp ? "done" : "idle")
  const [message, setMessage] = React.useState<string>()
  const forced = formPhase(stateProp)
  const current = forced ?? phase
  const expired = trialDaysLeft <= 0
  const t = (macText: string, other: string) => (mac ? macText : other)

  async function activate(e?: React.FormEvent) {
    e?.preventDefault()
    const clean = key.replace(/\s+/g, "")
    if (!clean) {
      setPhase("error")
      setMessage("Enter the licence key from your receipt email.")
      return
    }
    setPhase("sending")
    setMessage(undefined)
    try {
      let result: Desktop4Licence | void
      if (onActivate) result = await onActivate(clean)
      else {
        await new Promise((r) => setTimeout(r, 900))
        if (clean.length < 16) throw new Error("That key is not valid. Check that you copied all of it.")
        result = { licensedTo: "you@example.com", plan: "Pro" }
      }
      setLicence(result || { licensedTo: "", plan: undefined })
      setPhase("done")
    } catch (err) {
      setPhase("error")
      setMessage(err instanceof Error && err.message ? err.message : "The key could not be checked. Try again in a moment.")
    }
  }

  const done = current === "done"
  const sending = current === "sending"
  const errorText = current === "error" ? (forced === "error" ? (errorState?.description ?? "This key has reached its device limit. Deactivate it on another device, then try again.") : message) : undefined

  const content = done ? (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className={cn("flex gap-4", mac ? "flex-col items-center text-center" : "items-center")}>
        <AppIcon icon={icon} className={mac ? "size-16" : "size-12"} />
        <div aria-live="polite">
          <h2 id={`${id}-title`} className="flex items-center gap-2 text-lg font-semibold">
            <BadgeCheck aria-hidden="true" className="text-chart-2 size-5" />
            {appName} {licence?.plan ?? "Pro"} is activated
          </h2>
          <p className="text-muted-foreground mt-1 text-[13px]">
            {licence?.licensedTo ? <>Licensed to <span className="text-foreground font-medium break-all">{licence.licensedTo}</span> on {device}.</> : <>Activated on {device}. Thank you for your support.</>}
          </p>
        </div>
      </div>
      <div className="flex-1" />
      <Actions
        feel={feel}
        start={
          onDeactivate ? (
            <Button variant="link" size="sm" className="px-0" onClick={async () => { await onDeactivate(); setLicence(undefined); setPhase("idle"); setKey("") }}>
              {t("Deactivate This Mac", `Deactivate ${device}`)}
            </Button>
          ) : null
        }
      >
        {[
          <Button key="done" size="sm" onClick={onDone}>
            Done
          </Button>,
        ]}
      </Actions>
    </div>
  ) : (
    <form onSubmit={activate} noValidate className="flex flex-1 flex-col gap-5 p-6">
      <div className={cn("flex gap-4", mac ? "flex-col items-center text-center" : "items-start")}>
        <AppIcon icon={icon} className={mac ? "size-16" : "size-12"} />
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-lg font-semibold text-pretty">
            {expired ? "Your free trial has ended" : `Activate ${appName}`}
          </h2>
          <p className="text-muted-foreground mt-1 text-[13px] text-pretty">
            {expired
              ? `Enter a licence key to keep using ${appName}. Your data is safe and waiting.`
              : `Enter the licence key from your receipt to unlock ${appName} on ${device}.`}
          </p>
        </div>
      </div>

      {!expired ? (
        <div className="grid gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Free trial</span>
            <span className="font-medium tabular-nums">{trialDaysLeft === 1 ? "1 day left" : `${trialDaysLeft} days left`}</span>
          </div>
          <Progress value={(trialDaysLeft / trialLength) * 100} aria-label={`Free trial: ${trialDaysLeft} of ${trialLength} days left`} />
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <label htmlFor={`${id}-key`} className="text-sm font-medium">
          Licence key
        </label>
        <Input
          id={`${id}-key`}
          dir="ltr"
          value={key}
          onChange={(e) => {
            setKey(e.target.value)
            if (phase === "error") setPhase("idle")
          }}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          readOnly={sending}
          aria-invalid={!!errorText || undefined}
          aria-describedby={errorText ? `${id}-error` : seatsNote ? `${id}-seats` : undefined}
          className="font-mono tracking-wider"
        />
        {errorText ? (
          <p id={`${id}-error`} role="alert" className="text-destructive flex items-start gap-1.5 text-[13px]">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            {errorText}
          </p>
        ) : seatsNote ? (
          <p id={`${id}-seats`} className="text-muted-foreground text-xs">
            {seatsNote}
          </p>
        ) : null}
      </div>

      <div className="flex-1" />
      <Actions
        feel={feel}
        start={
          <a href={buyUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}>
            {t("Buy a Licence…", "Buy a licence")}
          </a>
        }
      >
        {[
          expired ? (
            <Button key="quit" type="button" variant="outline" size="sm" onClick={onQuit}>
              {t(`Quit ${appName}`, "Quit")}
            </Button>
          ) : (
            <Button key="trial" type="button" variant="outline" size="sm" onClick={onContinueTrial} disabled={sending}>
              {t("Continue Trial", "Continue trial")}
            </Button>
          ),
          <Button key="activate" type="submit" size="sm" disabled={sending} aria-disabled={sending || undefined}>
            {sending ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <KeyRound aria-hidden="true" />}
            {sending ? "Activating…" : "Activate"}
          </Button>,
        ]}
      </Actions>
      <p aria-live="polite" className="sr-only">
        {sending ? "Checking the licence key" : ""}
      </p>
    </form>
  )

  if (!frame)
    return (
      <div data-slot="desktop-4" data-state={done ? "success" : current === "sending" ? "submitting" : current === "error" ? "error" : "ready"} data-feel={feelProp} role="region" aria-labelledby={`${id}-title`} className={cn("flex flex-col", className)} {...frameProps(props)}>
        {content}
      </div>
    )
  return (
    <AppWindow
      data-slot="desktop-4"
      data-state={done ? "success" : current === "sending" ? "submitting" : current === "error" ? "error" : "ready"}
      feel={feel}
      onClose={onDone}
      role="region"
      aria-labelledby={`${id}-title`}
      className={cn("h-[30rem] w-full max-w-md", className)}
      {...frameProps(props)}
    >
      <AppWindowTitleBar title={win ? `${appName} licence` : ""} icon={<KeyRound />} className="border-b-0" />
      <AppWindowContent className="flex flex-col">{content}</AppWindowContent>
    </AppWindow>
  )
}

export { Desktop4, type Desktop4Props, type Desktop4Licence }
