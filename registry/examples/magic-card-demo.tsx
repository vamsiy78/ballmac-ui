import { Gauge, Layers, ShieldCheck } from "lucide-react"

import { MagicCard } from "@/components/ballmac/magic-card"

const features = [
  { icon: Gauge, title: "Fast by default", body: "Every component ships with the smallest runtime it can." },
  { icon: Layers, title: "Composable", body: "Small parts that fit together instead of one giant API." },
  { icon: ShieldCheck, title: "Accessible", body: "Keyboard and screen reader support is part of the code." },
]

export default function MagicCardDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
      {features.map(({ icon: Icon, title, body }) => (
        <MagicCard key={title} contentClassName="p-5" tabIndex={0}>
          <Icon aria-hidden="true" className="size-5 text-foreground" />
          <h3 className="mt-3 text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{body}</p>
        </MagicCard>
      ))}
    </div>
  )
}
