import { Hero7 } from "@/components/ballmac/blocks/hero-7/hero-7"

const rows = [
  ["checkout-v2", "Passing", "41s", "bg-chart-2"],
  ["fix/rate-limit", "Passing", "38s", "bg-chart-2"],
  ["feat/invoices-api", "Running", "—", "bg-chart-3"],
  ["chore/deps", "Failed", "1m 12s", "bg-destructive"],
]

/** A custom screen: any UI laid out 1180px wide is scaled to fit the frame. */
function Deploys() {
  return (
    <div aria-hidden="true" inert className="bg-background text-foreground h-[700px] w-[1180px] p-10">
      <p className="text-3xl font-semibold tracking-tight">Deployments</p>
      <p className="text-muted-foreground mt-1">Every branch gets a preview URL.</p>
      <ul className="mt-8 divide-y rounded-2xl border">
        {rows.map(([name, status, time, dot]) => (
          <li key={name} className="flex items-center gap-4 px-6 py-5 text-lg">
            <span className={`size-2.5 rounded-full ${dot}`} />
            <span className="flex-1 font-mono">{name}</span>
            <span className="text-muted-foreground w-28">{status}</span>
            <span className="text-muted-foreground w-24 text-right tabular-nums">{time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Hero7Custom() {
  return (
    <Hero7
      eyebrow="Deploys, minus the waiting"
      title="Every branch, live in under a minute."
      description="Preview URLs, build logs and rollbacks in one place, so reviews happen on the real thing."
      primaryAction={{ label: "Connect a repo", href: "#" }}
      url="deploy.acme.dev/projects/web"
      tilt={16}
      screen={<Deploys />}
    />
  )
}
