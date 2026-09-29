import { Check } from "lucide-react"

import { ScrambleText } from "@/components/ballmac/scramble-text"

const steps = [
  { label: "Resolved 214 packages", meta: "1.2s" },
  { label: "Built 38 routes", meta: "8.4s" },
  { label: "Uploaded to 35 regions", meta: "3.1s" },
  { label: "Health checks passed", meta: "0.9s" },
]

export default function ScrambleTextDemo() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2 rounded-full bg-chart-2" aria-hidden="true" />
        <span className="font-mono text-xs text-muted-foreground">acme deploy --prod</span>
      </div>
      <div className="p-5">
        <ScrambleText as="h3" mono duration={1100} className="text-lg font-semibold tracking-tight">
          PRODUCTION IS LIVE
        </ScrambleText>
        <ul className="mt-4 space-y-2 font-mono text-[13px]">
          {steps.map((step, i) => (
            <li key={step.label} className="flex items-center gap-2.5">
              <Check className="size-3.5 shrink-0 text-[color-mix(in_oklch,var(--chart-2),black_42%)] dark:text-chart-2" aria-hidden="true" />
              <ScrambleText mono delay={250 + i * 220} duration={700} className="min-w-0 flex-1">
                {step.label}
              </ScrambleText>
              <span className="text-muted-foreground tabular-nums">{step.meta}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between rounded-md border bg-background px-3 py-2 font-mono text-[13px]">
          <ScrambleText mono delay={1200} duration={900} characters="0123456789abcdef">
            https://acme.com
          </ScrambleText>
          <span className="text-xs text-[color-mix(in_oklch,var(--chart-2),black_42%)] dark:text-chart-2">200 OK</span>
        </div>
      </div>
    </div>
  )
}
