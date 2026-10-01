// Ballmac UI: Verify 1. https://ui.ballmac.com/blocks/verify-1
"use client"

import * as React from "react"
import { Check, ShieldCheck } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Button, buttonVariants } from "@/components/ballmac/button"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ballmac/input-otp"
import { cn } from "@/lib/utils"

type Verify1Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Where the code was sent. Shown partly masked. */
  email?: string
  /** Heading. */
  title?: string
  /** Digits in the code. */
  length?: number
  /**
   * Called with the full code, as soon as the last digit is typed or pasted. Throw to show "wrong code"; resolve to show success.
   * Without it, any code except all zeros is accepted after a short pause, so you can try the states.
   */
  onVerify?: (code: string) => void | Promise<void>
  /** Called by "Resend code". Without it the countdown simply restarts. */
  onResend?: () => void | Promise<void>
  /** Seconds before "Resend code" works again. */
  resendAfter?: number
  /** Called by "Use a different email". Pass null to hide it. */
  onChangeEmail?: (() => void) | null
  /** Where the success button goes. */
  continueHref?: string
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!domain) return email
  return `${name.slice(0, 1)}${"•".repeat(Math.max(name.length - 1, 2))}@${domain}`
}

function Verify1({
  email = "jordan@acme.com",
  title = "Enter your code",
  length = 6,
  onVerify,
  onResend,
  resendAfter = 30,
  onChangeEmail = () => {},
  continueHref = "#",
  className,
  ...props
}: Verify1Props) {
  const reduce = useReducedMotion()
  const [code, setCode] = React.useState("")
  const [state, setState] = React.useState<"idle" | "checking" | "wrong" | "done">("idle")
  const [wait, setWait] = React.useState(resendAfter)
  const [resent, setResent] = React.useState(false)
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const otpRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (wait <= 0) return
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000)
    return () => window.clearTimeout(id)
  }, [wait])

  async function check(value: string) {
    setState("checking")
    try {
      if (onVerify) await onVerify(value)
      else {
        await new Promise((r) => setTimeout(r, 800))
        if (/^0+$/.test(value)) throw new Error("wrong")
      }
      setState("done")
      window.setTimeout(() => headingRef.current?.focus(), 0)
    } catch {
      setState("wrong")
      setCode("")
      window.setTimeout(() => otpRef.current?.focus(), 0)
    }
  }

  async function resend() {
    setResent(true)
    setCode("")
    setState("idle")
    setWait(resendAfter)
    await onResend?.()
    otpRef.current?.focus()
  }

  const half = Math.ceil(length / 2)
  const slots = Array.from({ length }, (_, i) => i)
  return (
    <section data-slot="verify-1" className={cn("flex min-h-[36rem] items-center justify-center px-4 py-14", className)} {...props}>
      <div className="bg-card w-full max-w-md rounded-3xl border p-7 text-center shadow-[0_30px_80px_-50px_rgb(0_0_0/0.4)] sm:p-9">
        {state === "done" ? (
          <div className="flex flex-col items-center py-4">
            <motion.span
              aria-hidden="true"
              initial={reduce ? false : { scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="bg-chart-2/15 flex size-14 items-center justify-center rounded-full"
            >
              <Check className="size-7" />
            </motion.span>
            <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-semibold tracking-[-0.03em] outline-none">You’re verified</h1>
            <p role="status" className="text-muted-foreground mt-2 max-w-xs text-pretty">Thanks for confirming it’s you. Your account is ready to use.</p>
            <a href={continueHref} className={buttonVariants({ size: "lg", shape: "pill", className: "mt-8 w-full" })}>Continue</a>
          </div>
        ) : (
          <>
            <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-2xl"><ShieldCheck className="size-6" /></span>
            <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-semibold tracking-[-0.03em] outline-none">{title}</h1>
            <p className="text-muted-foreground mt-2 text-pretty">We sent a {length}-digit code to <span className="text-foreground font-medium">{maskEmail(email)}</span>. It expires in 10 minutes.</p>

            <motion.div
              className="mt-8 flex justify-center"
              animate={state === "wrong" && !reduce ? { x: [0, -8, 8, -6, 6, -3, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <InputOTP
                ref={otpRef}
                maxLength={length}
                value={code}
                autoFocus
                disabled={state === "checking"}
                aria-label={`${length}-digit verification code`}
                aria-invalid={state === "wrong" || undefined}
                aria-describedby="verify-1-status"
                onChange={(v) => { setCode(v); if (state === "wrong") setState("idle") }}
                onComplete={check}
              >
                <InputOTPGroup>{slots.slice(0, half).map((i) => <InputOTPSlot key={i} index={i} invalid={state === "wrong"} />)}</InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>{slots.slice(half).map((i) => <InputOTPSlot key={i} index={i} invalid={state === "wrong"} />)}</InputOTPGroup>
              </InputOTP>
            </motion.div>

            <p id="verify-1-status" role={state === "wrong" ? "alert" : "status"} className={cn("mt-4 min-h-5 text-sm", state === "wrong" ? "text-destructive" : "text-muted-foreground")}>
              {state === "checking" && "Checking your code…"}
              {state === "wrong" && "That code isn’t right. Check the email and try again."}
              {state === "idle" && resent && "A new code is on its way."}
            </p>

            <p className="text-muted-foreground mt-6 text-sm">
              {wait > 0 ? <>Didn’t get it? You can resend in <span className="tabular-nums">{wait}</span>s.</> : "Didn’t get the code?"}
            </p>
            <div className="mt-1 flex justify-center gap-2">
              <Button variant="ghost" size="sm" disabled={wait > 0 || state === "checking"} onClick={resend}>Resend code</Button>
              {onChangeEmail && <Button variant="ghost" size="sm" onClick={onChangeEmail}>Use a different email</Button>}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export { Verify1, type Verify1Props }
