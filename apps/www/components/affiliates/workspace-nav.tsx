import { ArrowUpRight, Layers3, LayoutDashboard, ShieldCheck, type LucideIcon } from "lucide-react"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { cn } from "@/lib/utils"

/** Shared navigation across the public program and the two private workspaces. */
export function WorkspaceNav({ current }: { current: "program" | "partner" | "admin" }) {
  const items: { key: string; href: string; label: string; icon: LucideIcon }[] = [
    { key: "program", href: "/affiliates", label: "Program", icon: ArrowUpRight },
    { key: "partner", href: "/affiliates/dashboard", label: "Workspace", icon: LayoutDashboard },
    ...(current === "admin"
      ? [{ key: "admin", href: "/affiliates/admin", label: "Admin", icon: ShieldCheck }]
      : []),
  ]
  return (
    <nav
      aria-label="Partner program navigation"
      className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-5"
    >
      <a
        href="/affiliates"
        className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Layers3 className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold tracking-tight">
          Ballmac <span className="text-muted-foreground font-normal">/ Partners</span>
        </span>
      </a>
      <div className="flex items-center gap-1 rounded-xl border bg-muted/30 p-1">
        {items.map(({ key, href, label, icon: Icon }) => (
          <a
            key={key}
            href={href}
            aria-current={current === key ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
              current === key
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </a>
        ))}
        {current !== "program" && <ThemeToggle />}
      </div>
    </nav>
  )
}
