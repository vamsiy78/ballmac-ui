import { ArrowDownLeft, ArrowUpRight, Coffee, Plus, ShoppingBag, Train } from "lucide-react"

import { PhoneFrame } from "@/components/ballmac/phone-frame"

const activity = [
  { icon: Coffee, name: "Corner Café", detail: "Today, 8:12", amount: "−$4.80" },
  { icon: ArrowDownLeft, name: "From Sam", detail: "Yesterday", amount: "+$120.00", incoming: true },
  { icon: Train, name: "City Transit", detail: "Yesterday", amount: "−$2.75" },
  { icon: ShoppingBag, name: "Market Hall", detail: "Mon", amount: "−$38.12" },
]

function Wallet() {
  return (
    <div className="flex h-full flex-col px-5 pb-8 text-[15px]">
      <div className="flex items-center justify-between pt-2">
        <p className="text-[28px] font-bold tracking-tight">Wallet</p>
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground">
          <Plus className="size-4" aria-hidden="true" />
        </span>
      </div>

      {/* Stacked cards */}
      <div className="relative mt-4 h-[236px]">
        <div className="absolute inset-x-3 top-0 h-[200px] rounded-2xl bg-[linear-gradient(135deg,var(--chart-2),var(--chart-1))] opacity-60" />
        <div className="absolute inset-x-1.5 top-3 h-[200px] rounded-2xl bg-[linear-gradient(135deg,var(--chart-3),var(--chart-5))] opacity-80" />
        <div className="absolute inset-x-0 top-7 flex h-[208px] flex-col overflow-hidden rounded-2xl bg-[linear-gradient(140deg,var(--chart-1),var(--chart-4)_70%,var(--chart-5))] p-5 text-white shadow-[0_18px_40px_-16px_rgb(0_0_0/0.5)]">
          <span className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-center justify-between text-[13px] font-medium text-white/85">
            <span>Acme Card</span>
            <span className="font-mono">•••• 4821</span>
          </div>
          <p className="relative mt-auto text-[12px] text-white/75">Balance</p>
          <p className="relative text-[32px] font-semibold tracking-tight tabular-nums">$12,480.20</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {[
          { icon: ArrowUpRight, label: "Send" },
          { icon: ArrowDownLeft, label: "Request" },
          { icon: Plus, label: "Top up" },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/70 py-3 text-[12px] font-medium">
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>

      <p className="mt-6 text-[13px] font-semibold text-muted-foreground">Latest</p>
      <div className="mt-2 divide-y rounded-xl border bg-card">
        {activity.map(({ icon: Icon, name, detail, amount, incoming }) => (
          <div key={name} className="flex items-center gap-3 px-3.5 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-muted">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">{name}</span>
              <span className="block text-[12px] text-muted-foreground">{detail}</span>
            </span>
            <span className={`text-[14px] font-medium tabular-nums ${incoming ? "text-chart-2" : ""}`}>{amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PhoneFrameDemo() {
  return (
    <div className="flex w-full justify-center py-4">
      <PhoneFrame screenWidth={390} className="w-[248px]">
        <Wallet />
      </PhoneFrame>
    </div>
  )
}
