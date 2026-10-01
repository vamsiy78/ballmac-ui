import { Check } from "lucide-react"

import { NeonCard } from "@/components/ballmac/neon-card"

export default function NeonCardDemo() {
  return (
    <NeonCard className="w-full max-w-xs" glow={0.7} radius="2xl" contentClassName="p-6">
      <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Most popular</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">$39</span>
        <span className="text-sm text-muted-foreground">per seat / month</span>
      </p>
      <ul className="mt-4 grid gap-2 text-sm">
        {["Unlimited projects", "Priority support", "Single sign-on"].map((x) => (
          <li key={x} className="flex items-center gap-2">
            <Check aria-hidden="true" className="size-4 text-foreground" />
            {x}
          </li>
        ))}
      </ul>
    </NeonCard>
  )
}
