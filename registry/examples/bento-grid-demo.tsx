import {
  Bell,
  Calendar,
  Cloud,
  CreditCard,
  Database,
  GitBranch,
  Mail,
  MessageSquare,
  Search,
  Webhook,
  Zap,
} from "lucide-react"

import { AnimatedGrid } from "@/components/ballmac/animated-grid"
import { BentoCard, BentoGrid } from "@/components/ballmac/bento-grid"
import { BorderBeam } from "@/components/ballmac/border-beam"
import { Marquee } from "@/components/ballmac/marquee"
import { NumberTicker } from "@/components/ballmac/number-ticker"

const regions = [
  { code: "iad1", x: "18%", y: "22%" },
  { code: "fra1", x: "50%", y: "13%" },
  { code: "sin1", x: "80%", y: "30%" },
  { code: "gru1", x: "36%", y: "42%" },
  { code: "syd1", x: "66%", y: "48%" },
]

function Regions() {
  return (
    <div className="absolute inset-0">
      <AnimatedGrid cellSize={32} count={10} interval={500} />
      {regions.map((r) => (
        <span
          key={r.code}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border bg-background/90 px-2 py-0.5 font-mono text-[11px] shadow-xs"
          style={{ left: r.x, top: r.y }}
        >
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-chart-2 opacity-60 motion-reduce:animate-none" />
            <span className="relative size-1.5 rounded-full bg-chart-2" />
          </span>
          {r.code}
        </span>
      ))}
    </div>
  )
}

function Uptime() {
  return (
    <div className="absolute inset-x-5 top-5 flex flex-col gap-3">
      <p className="text-4xl font-semibold tracking-tight">
        <NumberTicker value={99.99} from={97} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
        <span className="text-muted-foreground">%</span>
      </p>
      <div className="flex h-10 items-end gap-[3px]">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className={i === 19 ? "h-1/2 flex-1 rounded-sm bg-chart-3" : "h-full flex-1 rounded-sm bg-chart-2/70"}
          />
        ))}
      </div>
    </div>
  )
}

const apps = [Bell, CreditCard, Calendar, Database, Webhook, Mail, Cloud, MessageSquare, Zap]

function Integrations() {
  const tile = (Icon: (typeof apps)[number], i: number) => (
    <span
      key={i}
      className="flex size-12 items-center justify-center rounded-xl border bg-background shadow-xs [&_svg]:size-5"
    >
      <Icon aria-hidden="true" className={["text-[color-mix(in_oklch,var(--chart-1),black_42%)] dark:text-chart-1", "text-chart-4", "text-chart-2", "text-chart-5"][i % 4]} />
    </span>
  )
  return (
    <div className="absolute inset-x-0 top-5 flex flex-col gap-3">
      <Marquee speed={24} gap={12}>{apps.map(tile)}</Marquee>
      <Marquee speed={24} gap={12} reverse>{[...apps].reverse().map(tile)}</Marquee>
    </div>
  )
}

function CommandMenu() {
  return (
    <div className="absolute inset-x-5 top-5 overflow-hidden rounded-lg border bg-background text-xs shadow-sm">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-muted-foreground">
        <Search className="size-3.5" aria-hidden="true" />
        Deploy
        <span className="ml-auto rounded border px-1 font-mono text-[10px]">⌘K</span>
      </div>
      {["Deploy main to production", "Roll back last deploy"].map((item, i) => (
        <div key={item} className={`flex items-center gap-2 px-3 py-1.5 ${i === 0 ? "bg-accent text-accent-foreground" : ""}`}>
          <Zap className="size-3.5 text-muted-foreground" aria-hidden="true" />
          {item}
        </div>
      ))}
    </div>
  )
}

function Previews() {
  return (
    <div className="absolute inset-x-5 top-5 flex flex-col gap-2 font-mono text-[11px]">
      {[
        { branch: "feat/billing-v2", state: "Building", live: true },
        { branch: "fix/login-redirect", state: "Ready" },
              ].map((b) => (
        <div key={b.branch} className="relative flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5">
          <GitBranch className="size-3.5 text-muted-foreground" aria-hidden="true" />
          {b.branch}
          <span className={`ml-auto ${b.live ? "text-[color-mix(in_oklch,var(--chart-1),black_42%)] dark:text-chart-1" : "text-muted-foreground"}`}>{b.state}</span>
          {b.live && <BorderBeam size={50} duration={3} />}
        </div>
      ))}
    </div>
  )
}

export default function BentoGridDemo() {
  return (
    <BentoGrid className="max-w-3xl" rowHeight="15rem">
      <BentoCard
        colSpan={2}
        title="Deploy to every region"
        description="Push once; live in 35 regions in under a minute."
        href="#"
        cta="See regions"
        background={<Regions />}
      />
      <BentoCard
        title="Uptime you can show"
        description="Public status page included."
        href="#"
        background={<Uptime />}
      />
      <BentoCard
        title="Integrations"
        description="Plug in the tools you already use."
        href="#"
        cta="Browse"
        background={<Integrations />}
      />
      <BentoCard
        title="Keyboard first"
        description="Every action is in the command menu."
        href="#"
        background={<CommandMenu />}
      />
      <BentoCard
        title="Branch previews"
        description="A live URL for every pull request."
        href="#"
        background={<Previews />}
      />
    </BentoGrid>
  )
}
