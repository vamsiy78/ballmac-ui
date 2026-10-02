// Ballmac UI: Features 6. https://ui.ballmac.com/blocks/features-6
import * as React from "react"
import { ArrowRight, BarChart3, Check, MessageSquare, Plug, ShieldCheck } from "lucide-react"

import { AnimatedTabs, AnimatedTabsContent, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ballmac/animated-tabs"
import { Badge } from "@/components/ballmac/badge"
import { cn } from "@/lib/utils"
import { Media, type MediaSource } from "@/components/ballmac/media"

type Features6Tab = {
  /** Stable key for the tab. */
  value: string
  /** Short tab label. */
  label: string
  /** Icon shown before the label. */
  icon?: React.ReactNode
  /** Panel heading. */
  title: string
  /** One or two sentences. */
  description: string
  /** Short checked points. */
  points?: string[]
  /** Link under the points. */
  link?: { label: string; href: string }
  /** Sample picture on the right of the panel. Decorative: the text must say what it shows. Replaced by `image` when you set one. */
  visual?: React.ReactNode
  /** Your own picture for this tab: an image URL (give it imageAlt), an object with alt text and a dark-mode file, or your own element. */
  image?: MediaSource
  /** Describes `image` when it is a plain URL. */
  imageAlt?: string
}

type Features6Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** The tabs, in order. */
  tabs?: Features6Tab[]
  /** Tab selected first. Defaults to the first tab. */
  defaultValue?: string
}

const tile = "bg-card w-full max-w-sm rounded-2xl border p-5 shadow-[0_30px_70px_-35px_rgb(0_0_0/0.4)]"

function AnalyticsVisual() {
  const bars = [38, 52, 44, 66, 58, 79, 72, 91]
  return (
    <div className={tile}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-xs">Weekly active users</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">24,810</p>
        </div>
        <Badge status="success">+18.2%</Badge>
      </div>
      <div className="mt-6 flex h-32 items-end gap-2">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn("flex-1 rounded-t-md", i === bars.length - 1 ? "bg-chart-1" : "bg-chart-1/30")}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="text-muted-foreground mt-2 flex justify-between text-[11px]">
        <span>Aug 3</span>
        <span>Sep 21</span>
      </div>
    </div>
  )
}

function CollabVisual() {
  return (
    <div className={tile}>
      <div className="space-y-4">
        {[
          ["MK", "Maya", "Can we move the launch to the 14th?", "bg-chart-1/25"],
          ["JO", "Jonas", "Yes. I’ll update the plan and ping design.", "bg-chart-3/25"],
        ].map(([i, n, t, c]) => (
          <div key={n} className="flex gap-3">
            <span className={cn("text-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold", c)}>{i}</span>
            <div>
              <p className="text-sm font-medium">{n} <span className="text-muted-foreground font-normal">· just now</span></p>
              <p className="text-muted-foreground mt-0.5 text-sm">{t}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mt-5 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm">
        <span className="bg-chart-1 h-4 w-px animate-pulse motion-reduce:animate-none" /> Amara is typing…
      </div>
    </div>
  )
}

function SecurityVisual() {
  const rows = [
    ["Signed in with SSO", "Maya K.", "2m ago"],
    ["Role changed to Admin", "Jonas O.", "1h ago"],
    ["API key created", "Amara S.", "3h ago"],
    ["Export downloaded", "Maya K.", "Yesterday"],
  ]
  return (
    <div className={tile}>
      <p className="text-sm font-medium">Audit log</p>
      <ul className="mt-3 divide-y">
        {rows.map(([a, w, t]) => (
          <li key={a} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div className="min-w-0">
              <p className="truncate">{a}</p>
              <p className="text-muted-foreground text-xs">{w}</p>
            </div>
            <span className="text-muted-foreground shrink-0 text-xs">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function IntegrationsVisual() {
  const apps = [
    ["Slack", true],
    ["GitHub", true],
    ["Linear", true],
    ["Notion", false],
    ["Stripe", true],
    ["Zapier", false],
  ] as const
  return (
    <div className={tile}>
      <p className="text-sm font-medium">Connected apps</p>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {apps.map(([name, on]) => (
          <div key={name} className="flex flex-col items-center gap-2 rounded-xl border p-3 text-center">
            <span className="bg-muted flex size-9 items-center justify-center rounded-lg text-sm font-semibold">{name[0]}</span>
            <span className="text-xs">{name}</span>
            <span className={cn("flex items-center gap-1 text-[11px]", on ? "text-chart-2" : "text-muted-foreground")}>
              {on ? <><Check className="size-3" /> Connected</> : "Connect"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const defaultTabs: Features6Tab[] = [
  {
    value: "analytics",
    label: "Analytics",
    icon: <BarChart3 />,
    title: "Know what’s working, the same day.",
    description: "Dashboards update as events arrive. Break any chart down by plan, country or campaign without writing a query.",
    points: ["Real-time dashboards", "Cohorts and funnels", "Scheduled email reports"],
    link: { label: "Explore analytics", href: "#" },
    visual: <AnalyticsVisual />,
  },
  {
    value: "collaboration",
    label: "Collaboration",
    icon: <MessageSquare />,
    title: "Decide together, in context.",
    description: "Comment on anything, mention a teammate and keep the whole conversation next to the work it is about.",
    points: ["Threaded comments", "Mentions and reminders", "Live cursors and presence"],
    link: { label: "See collaboration", href: "#" },
    visual: <CollabVisual />,
  },
  {
    value: "security",
    label: "Security",
    icon: <ShieldCheck />,
    title: "Enterprise controls without the enterprise setup.",
    description: "Single sign-on, roles and a complete audit trail are included, so security reviews stop blocking your launch.",
    points: ["SAML SSO and SCIM", "Role-based access", "Exportable audit log"],
    link: { label: "Read the security overview", href: "#" },
    visual: <SecurityVisual />,
  },
  {
    value: "integrations",
    label: "Integrations",
    icon: <Plug />,
    title: "Plays well with your stack.",
    description: "Connect the tools your team already lives in. Data flows both ways and stays in sync.",
    points: ["80+ native integrations", "Webhooks and a REST API", "Two-way sync"],
    link: { label: "Browse integrations", href: "#" },
    visual: <IntegrationsVisual />,
  },
]

function Features6({
  title = "Everything your team needs, in one place.",
  description = "Pick a topic to see how it works.",
  tabs = defaultTabs,
  defaultValue,
  className,
  ...props
}: Features6Props) {
  return (
    <section data-slot="features-6" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </div>
      <AnimatedTabs defaultValue={defaultValue ?? tabs[0]?.value} className="mt-10 md:mt-14">
        <div className="-mx-4 flex justify-center overflow-x-auto px-4 [scrollbar-width:none]">
          <AnimatedTabsList aria-label="Feature areas" className="h-11">
            {tabs.map((t) => (
              <AnimatedTabsTrigger key={t.value} value={t.value} className="px-4">
                {t.icon}
                {t.label}
              </AnimatedTabsTrigger>
            ))}
          </AnimatedTabsList>
        </div>
        {tabs.map((t) => (
          <AnimatedTabsContent key={t.value} value={t.value} className="mt-8">
            <div className="bg-card grid overflow-hidden rounded-3xl border md:grid-cols-[1fr_1.05fr]">
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">{t.title}</h3>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty">{t.description}</p>
                {t.points && (
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {t.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <Check className="text-chart-2 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
                {t.link && (
                  <a href={t.link.href} className="group/link focus-visible:ring-ring/50 mt-8 inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium outline-none focus-visible:ring-[3px]">
                    {t.link.label}
                    <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover/link:-translate-x-0.5" aria-hidden="true" />
                  </a>
                )}
              </div>
              <div aria-hidden={t.image ? undefined : true} className="bg-muted/40 relative flex items-center justify-center border-t p-6 sm:p-10 md:border-t-0 md:border-s">
                <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
                <div className="relative flex w-full justify-center">{t.image ? <Media media={t.image} alt={t.imageAlt} fit="contain" className="w-full rounded-xl" /> : t.visual}</div>
              </div>
            </div>
          </AnimatedTabsContent>
        ))}
      </AnimatedTabs>
    </section>
  )
}

export { Features6, type Features6Props, type Features6Tab }
