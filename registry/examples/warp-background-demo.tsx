import { WarpBackground } from "@/components/ballmac/warp-background"

export default function WarpBackgroundDemo() {
  return (
    <WarpBackground className="h-80 w-full max-w-2xl rounded-2xl border" contentClassName="flex h-80 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Launching soon</p>
      <h3 className="text-4xl font-semibold tracking-tight sm:text-5xl">Light speed, no jank</h3>
      <p className="max-w-xs text-sm text-muted-foreground">Join the waitlist to get early access.</p>
    </WarpBackground>
  )
}
