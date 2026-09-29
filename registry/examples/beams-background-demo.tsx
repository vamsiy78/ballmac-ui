import { BeamsBackground } from "@/components/ballmac/beams-background"
import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"

export default function BeamsBackgroundDemo() {
  return (
    <div className="relative isolate flex h-[380px] w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-background px-6 text-center">
      <BeamsBackground className="-z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_40%_at_50%_48%,var(--background)_20%,transparent)]"
      />
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Private beta</span>
      <h2 className="mt-3 max-w-md text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Join the waitlist.
      </h2>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        We&apos;re letting teams in every week. Leave your email and we&apos;ll save you a seat.
      </p>
      <form className="mt-7 flex w-full max-w-sm flex-col gap-2 sm:flex-row" action="#">
        <label htmlFor="beams-email" className="sr-only">
          Email address
        </label>
        <Input
          id="beams-email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          className="bg-background/70 backdrop-blur"
        />
        <Button type="submit" className="shrink-0">
          Request access
        </Button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">2,400+ teams already waiting</p>
    </div>
  )
}
