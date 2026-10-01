import { Features5, type Features5Step } from "@/components/ballmac/blocks/features-5/features-5"

const frame = "bg-card w-full max-w-sm rounded-2xl border p-5 font-mono text-sm shadow-[0_30px_70px_-35px_rgb(0_0_0/0.4)]"

const steps: Features5Step[] = [
  {
    title: "Connect your repository",
    description: "Install the GitHub app and pick a repo. We detect your framework and build settings for you.",
    points: ["Works with monorepos", "No config file needed"],
    visual: (
      <div className={frame}>
        <p className="text-muted-foreground">$ acme init</p>
        <p className="mt-2">Detected <span className="font-semibold">Next.js 16</span></p>
        <p>Detected <span className="font-semibold">pnpm workspace</span></p>
        <p className="mt-2 font-semibold">✓ Connected acme/web</p>
      </div>
    ),
  },
  {
    title: "Push a branch",
    description: "Every push builds in an isolated environment and posts a preview link on your pull request.",
    points: ["Median build under a minute", "Cached dependencies"],
    visual: (
      <div className={frame}>
        <p>feat/checkout-v2</p>
        <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full"><div className="bg-chart-1 h-full w-4/5 rounded-full" /></div>
        <p className="text-muted-foreground mt-3">Building… 41s</p>
      </div>
    ),
  },
  {
    title: "Ship with a rollback ready",
    description: "Promote a preview to production in one click. If something looks wrong, roll back just as fast.",
    points: ["Instant rollback", "Audit log of every deploy"],
    visual: (
      <div className={frame}>
        <p className="font-semibold">● Production</p>
        <p className="mt-2">checkout-v2 · 2 minutes ago</p>
        <p className="text-muted-foreground mt-3">↩ Roll back to a1b2c3d</p>
      </div>
    ),
  },
]

export default function Features5Custom() {
  return <Features5 eyebrow="Deploys" title="Three steps to production." description="From git push to live traffic." steps={steps} />
}
