import { ArrowUpRight, Command } from "lucide-react"

import { TiltCard, TiltCardLayer } from "@/components/ballmac/tilt-card"

export default function TiltCardProduct() {
  return (
    <div className="flex w-full justify-center px-2 py-8">
      <TiltCard maxTilt={8} className="w-full max-w-[300px] p-0">
        <a
          href="#"
          className="block rounded-[inherit] p-5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <div className="relative flex h-40 items-center justify-center rounded-lg border bg-muted/50 transform-3d">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklch,var(--chart-1)_28%,transparent),transparent_65%)]"
            />
            <TiltCardLayer depth={50}>
              <span className="flex size-16 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,var(--chart-1),var(--chart-4))] text-white shadow-[0_18px_30px_-12px_color-mix(in_oklch,var(--chart-4)_70%,transparent)]">
                <Command className="size-7" aria-hidden="true" />
              </span>
            </TiltCardLayer>
          </div>
          <TiltCardLayer depth={16} className="mt-4 flex items-start justify-between gap-3">
            <span>
              <span className="block text-sm font-semibold">Command Palette</span>
              <span className="mt-1 block text-sm text-muted-foreground">Every action, two keystrokes away.</span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" aria-hidden="true" />
          </TiltCardLayer>
        </a>
      </TiltCard>
    </div>
  )
}
