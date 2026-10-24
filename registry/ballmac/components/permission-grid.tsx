// Ballmac UI: Permission Grid. https://ui.ballmac.com/components/permission-grid
"use client"

import * as React from "react"
import { Ban, Check, HelpCircle, ShieldAlert, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type Decision = "allow" | "ask" | "deny"
type Risk = "low" | "medium" | "high"

type Permission = {
  id: string
  /** What the agent can do, for example "Run shell commands". */
  label: string
  /** One line on what it means in practice. */
  description?: string
  /** How much harm a mistake could do. Shown in words. */
  risk?: Risk
  /** A heading to group related permissions under, such as "Files". */
  group?: string
}

type PermissionPreset = {
  id: string
  /** Button text, for example "Cautious". */
  label: string
  /** The decision for each permission id. Ids it leaves out are not changed. */
  values: Record<string, Decision>
}

const DECISIONS: { value: Decision; icon: LucideIcon; fallback: string }[] = [
  { value: "allow", icon: Check, fallback: "Allow" },
  { value: "ask", icon: HelpCircle, fallback: "Ask" },
  { value: "deny", icon: Ban, fallback: "Deny" },
]

type PermissionGridProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** The things the agent could do. */
  permissions: Permission[]
  /** The decision for each id. Controlled. */
  value?: Record<string, Decision>
  /** The starting decisions for uncontrolled use. Ids it leaves out start on Ask. */
  defaultValue?: Record<string, Decision>
  /** Called with the full set of decisions after any change. */
  onValueChange?: (value: Record<string, Decision>) => void
  /** One-click settings that fill the grid. */
  presets?: PermissionPreset[]
  /** Heading. */
  title?: string
}

/**
 * What an agent may do, one row per permission with Allow, Ask or Deny. Each row is a native radio group, so the arrow keys move between the three
 * answers and Tab moves to the next row. Risk is written out, and a risky permission set to Allow says it runs without asking.
 */
function PermissionGrid({ permissions, value: valueProp, defaultValue, onValueChange, presets, title, className, ...props }: PermissionGridProps) {
  const msg = useMessages()
  const uid = React.useId()
  title ??= msg("permission-grid.title", "What the agent may do")
  const [inner, setInner] = React.useState<Record<string, Decision>>(defaultValue ?? {})
  const value = valueProp ?? inner
  const decision = (id: string): Decision => value[id] ?? "ask"

  function commit(next: Record<string, Decision>) {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }
  const counts = { allow: 0, ask: 0, deny: 0 }
  for (const p of permissions) counts[decision(p.id)]++

  const groups: { name?: string; items: Permission[] }[] = []
  for (const p of permissions) {
    const last = groups[groups.length - 1]
    if (last && last.name === p.group) last.items.push(p)
    else groups.push({ name: p.group, items: [p] })
  }
  const riskText = (r: Risk) => msg(`permission-grid.risk.${r}`, r === "low" ? "Low risk" : r === "medium" ? "Medium risk" : "High risk")

  return (
    <div data-slot="permission-grid" className={cn("grid w-full min-w-0 gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p aria-live="polite" className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {msg("permission-grid.summary", "{allow} allowed, {ask} ask first, {deny} denied", counts)}
          </p>
        </div>
        {presets && presets.length > 0 && (
          <div role="group" aria-label={msg("permission-grid.presets", "Presets")} className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button key={p.id} type="button" onClick={() => commit({ ...Object.fromEntries(permissions.map((x) => [x.id, decision(x.id)])), ...p.values })} className="h-8 rounded-full border bg-background px-3 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[30rem] border-collapse text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-start font-medium">{msg("permission-grid.permission", "Permission")}</th>
              {DECISIONS.map((d) => (
                <th key={d.value} scope="col" className="w-20 px-2 py-2 text-center font-medium">{msg(`permission-grid.${d.value}`, d.fallback)}</th>
              ))}
            </tr>
          </thead>
          {groups.map((g, gi) => (
            <tbody key={g.name ?? gi} className="divide-y border-t">
              {g.name && (
                <tr className="bg-muted/20">
                  <th colSpan={4} scope="colgroup" className="px-3 py-1.5 text-start text-xs font-medium text-muted-foreground">{g.name}</th>
                </tr>
              )}
              {g.items.map((p) => {
                const d = decision(p.id)
                return (
                  <tr key={p.id} data-decision={d}>
                    <th scope="row" className="px-3 py-3 text-start font-normal">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-medium text-foreground">{p.label}</span>
                        {p.risk && (
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[11px]", p.risk === "high" ? "border-destructive/50 text-destructive" : "text-muted-foreground")}>
                            {p.risk === "high" && <ShieldAlert aria-hidden="true" className="size-3" />}
                            {riskText(p.risk)}
                          </span>
                        )}
                      </span>
                      {p.description && <span className="mt-0.5 block text-xs text-muted-foreground">{p.description}</span>}
                      {p.risk === "high" && d === "allow" && (
                        <span className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
                          <ShieldAlert aria-hidden="true" className="size-3" /> {msg("permission-grid.noAsk", "Runs without asking")}
                        </span>
                      )}
                    </th>
                    {DECISIONS.map((x) => (
                      <td key={x.value} className="px-2 py-3 text-center">
                        <label className="relative inline-flex size-8 cursor-pointer items-center justify-center">
                          <input type="radio" name={`${uid}-${p.id}`} value={x.value} checked={d === x.value} onChange={() => commit({ ...Object.fromEntries(permissions.map((y) => [y.id, decision(y.id)])), [p.id]: x.value })} aria-label={msg("permission-grid.radio", "{label}: {decision}", { label: p.label, decision: msg(`permission-grid.${x.value}`, x.fallback) })} className="peer sr-only" />
                          <span aria-hidden="true" className={cn("flex size-7 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 motion-reduce:transition-none", d === x.value ? (x.value === "deny" ? "border-destructive bg-destructive text-white" : "border-foreground bg-foreground text-background") : "text-muted-foreground/60 hover:bg-accent")}>
                            <x.icon className="size-3.5" />
                          </span>
                        </label>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  )
}

export { PermissionGrid, type Decision, type Permission, type PermissionGridProps, type PermissionPreset, type Risk }
