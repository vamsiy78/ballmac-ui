import { Check } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { GlowBorder } from "@/components/ballmac/glow-border"

const plans = [
  { name: "Starter", price: "$0", note: "For side projects", features: ["3 projects", "Community support", "7-day logs"] },
  {
    name: "Pro",
    price: "$24",
    note: "For teams shipping weekly",
    features: ["Unlimited projects", "Branch previews", "90-day logs", "Priority support"],
    featured: true,
  },
]

function Plan({ plan }: { plan: (typeof plans)[number] }) {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{plan.name}</p>
        {plan.featured && (
          <span className="rounded-full bg-[linear-gradient(90deg,var(--chart-1),var(--chart-4))] px-2.5 py-0.5 text-[11px] font-medium text-white">
            Most popular
          </span>
        )}
      </div>
      <p className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">{plan.price}</span>
        <span className="text-sm text-muted-foreground">/ month</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
      <ul className="mt-5 flex-1 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className={`size-4 ${plan.featured ? "text-chart-1" : "text-muted-foreground"}`} aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
      <a href="#" className={buttonVariants({ variant: plan.featured ? "default" : "outline", className: "mt-6 w-full" })}>
        {plan.featured ? "Upgrade to Pro" : "Get started"}
      </a>
    </div>
  )
}

export default function GlowBorderDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <div className="rounded-[14px] border bg-card sm:my-4">
        <Plan plan={plans[0]} />
      </div>
      <GlowBorder duration={5} width={1.5} radius={14}>
        <Plan plan={plans[1]} />
      </GlowBorder>
    </div>
  )
}
