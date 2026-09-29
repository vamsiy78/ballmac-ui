import * as React from "react"
import {
  Bell,
  Calendar,
  Cloud,
  Database,
  FileText,
  Image,
  Layers,
  Mail,
  MessageSquare,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { OrbitingCircles } from "@/components/ballmac/orbiting-circles"

function Tile({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      title={label}
      className={cn(
        "flex size-full items-center justify-center rounded-full border bg-card shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_6px_16px_-6px_rgb(0_0_0/0.18)] [&_svg]:size-[45%]",
        className
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default function OrbitingCirclesDemo() {
  return (
    <div className="relative flex h-[360px] w-full max-w-lg items-center justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--chart-1)_16%,transparent),transparent)]"
      />
      <div className="relative z-10 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.16),0_10px_30px_-8px_color-mix(in_oklch,var(--chart-1)_50%,transparent)]">
        <Layers className="size-7" aria-hidden="true" />
        <span className="sr-only">Acme</span>
      </div>
      <OrbitingCircles radius={78} duration={18} iconSize={34}>
        <Tile label="Mail"><Mail className="text-chart-1" /></Tile>
        <Tile label="Calendar"><Calendar className="text-chart-5" /></Tile>
        <Tile label="Messages"><MessageSquare className="text-chart-2" /></Tile>
      </OrbitingCircles>
      <OrbitingCircles radius={148} duration={32} iconSize={42} reverse startAngle={-60}>
        <Tile label="Database"><Database className="text-chart-4" /></Tile>
        <Tile label="Files"><FileText className="text-chart-1" /></Tile>
        <Tile label="Cloud"><Cloud className="text-chart-2" /></Tile>
        <Tile label="Photos"><Image className="text-chart-3" /></Tile>
        <Tile label="Alerts"><Bell className="text-chart-5" /></Tile>
      </OrbitingCircles>
    </div>
  )
}
