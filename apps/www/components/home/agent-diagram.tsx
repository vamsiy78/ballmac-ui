"use client"

import { Boxes, FolderCode, Sparkles, SquareTerminal, type LucideIcon } from "lucide-react"
import * as React from "react"

import { AnimatedBeam } from "@/components/ballmac/animated-beam"
import { cn } from "@/lib/utils"

function Node({ ref, icon: Icon, label, sub, className }: { ref: React.Ref<HTMLDivElement>; icon: LucideIcon; label: string; sub?: string; className?: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div ref={ref} className={cn("bg-card flex size-14 items-center justify-center rounded-2xl border shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.3)]", className)}>
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium">{label}</p>
        {sub && <p className="text-muted-foreground font-mono text-[10px]">{sub}</p>}
      </div>
    </div>
  )
}

const clients = ["Claude Code", "Cursor", "VS Code", "Codex"]

function Client({ ref, label }: { ref: React.Ref<HTMLDivElement>; label: string }) {
  return (
    <div ref={ref} className="bg-card relative z-10 flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium whitespace-nowrap">
      <Sparkles className="text-muted-foreground size-3.5" aria-hidden="true" />
      {label}
    </div>
  )
}

/** Agent clients talk to the shadcn MCP server, which reads the Ballmac registry and writes code into your project. */
export function AgentDiagram() {
  const container = React.useRef<HTMLDivElement>(null)
  const c0 = React.useRef<HTMLDivElement>(null)
  const c1 = React.useRef<HTMLDivElement>(null)
  const c2 = React.useRef<HTMLDivElement>(null)
  const c3 = React.useRef<HTMLDivElement>(null)
  const mcp = React.useRef<HTMLDivElement>(null)
  const registry = React.useRef<HTMLDivElement>(null)
  const project = React.useRef<HTMLDivElement>(null)
  return (
    <div ref={container} className="relative grid w-full grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-x-2 py-4" role="img" aria-label="AI agents such as Claude Code, Cursor, VS Code and Codex use the shadcn MCP server to read the Ballmac registry and add components to your project.">
      <div className="flex flex-col gap-3">
        <Client ref={c0} label={clients[0]} />
        <Client ref={c1} label={clients[1]} />
        <Client ref={c2} label={clients[2]} />
        <Client ref={c3} label={clients[3]} />
      </div>
      <span />
      <Node ref={mcp} icon={SquareTerminal} label="shadcn MCP" sub="7 tools" />
      <div className="flex justify-center">
        <Node ref={registry} icon={Boxes} label="@ballmac" sub="registry" className="bg-foreground text-background" />
      </div>
      <Node ref={project} icon={FolderCode} label="Your project" sub="components/ballmac" />
      <AnimatedBeam containerRef={container} fromRef={c0} toRef={mcp} curvature={42} duration={3.2} />
      <AnimatedBeam containerRef={container} fromRef={c1} toRef={mcp} curvature={14} duration={3.2} delay={0.4} />
      <AnimatedBeam containerRef={container} fromRef={c2} toRef={mcp} curvature={-14} duration={3.2} delay={0.8} />
      <AnimatedBeam containerRef={container} fromRef={c3} toRef={mcp} curvature={-42} duration={3.2} delay={1.2} />
      <AnimatedBeam containerRef={container} fromRef={mcp} toRef={registry} duration={3.2} delay={0.8} />
      <AnimatedBeam containerRef={container} fromRef={registry} toRef={project} duration={3.2} delay={1.4} />
    </div>
  )
}
