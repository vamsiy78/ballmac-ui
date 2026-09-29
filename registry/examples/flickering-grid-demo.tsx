import { FlickeringGrid } from "@/components/ballmac/flickering-grid"

export default function FlickeringGridDemo() {
  return (
    <div className="relative isolate flex h-[360px] w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-background px-6 text-center">
      <FlickeringGrid className="-z-10" maxOpacity={0.22} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_35%_at_50%_50%,var(--background),transparent)]"
      />
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Realtime</span>
      <h2 className="mt-3 max-w-md text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Every node, every second.
      </h2>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Live health for 12,000 machines, streamed to one screen without a refresh.
      </p>
    </div>
  )
}
