import { Ripple } from "@/components/ballmac/ripple"

export default function RippleDemo() {
  return (
    <div className="relative flex h-72 w-full max-w-lg items-center justify-center overflow-hidden rounded-xl border bg-card">
      <div className="relative z-10 text-center">
        <p className="text-2xl font-semibold tracking-tight text-foreground">Listening for events</p>
        <p className="mt-1 text-sm text-muted-foreground">Rings breathe quietly behind the content.</p>
      </div>
      <Ripple />
    </div>
  )
}
