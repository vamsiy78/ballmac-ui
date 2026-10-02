import { ArrowUpRight, KeyRound, Layers, ScrollText } from "lucide-react"

import { SpotlightCard } from "@/components/ballmac/spotlight-card"

const features = [
  { icon: KeyRound, title: "Scoped API keys", body: "Grant read or write per project, rotate without downtime.", href: "#keys" },
  { icon: Layers, title: "Preview environments", body: "Every pull request gets its own URL and database branch.", href: "#previews" },
  { icon: ScrollText, title: "Audit log", body: "Who changed what and when, exportable as CSV.", href: "#audit" },
]

export default function SpotlightCardGrid() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      {features.map(({ icon: Icon, title, body, href }) => (
        <SpotlightCard key={title} className="flex flex-col p-5">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-semibold">{title}</h3>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">{body}</p>
          <a
            href={href}
            className="mt-4 inline-flex items-center gap-1 self-start rounded-sm text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Learn more <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden="true" />
          </a>
        </SpotlightCard>
      ))}
    </div>
  )
}
