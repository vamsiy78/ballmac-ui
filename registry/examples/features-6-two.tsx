import { Code2, Rocket } from "lucide-react"

import { Features6 } from "@/components/ballmac/blocks/features-6/features-6"

const card = "bg-card w-full max-w-sm rounded-2xl border p-5 font-mono text-sm shadow-[0_30px_70px_-35px_rgb(0_0_0/0.4)]"

export default function Features6Two() {
  return (
    <Features6
      title="Built for developers."
      description="An API for everything you can do in the app."
      defaultValue="deploy"
      tabs={[
        {
          value: "api",
          label: "API",
          icon: <Code2 />,
          title: "A typed API for every action.",
          description: "Generate clients in your language and get autocompletion for every endpoint and field.",
          points: ["OpenAPI 3.1 spec", "Official SDKs for TypeScript, Python and Go"],
          visual: (
            <div className={card}>
              <p className="text-muted-foreground">// create an invoice</p>
              <p className="mt-2"><span className="font-semibold">await</span> acme.invoices.<span className="font-semibold">create</span>({"{"}</p>
              <p className="pl-4">customer: <span className="font-semibold">&quot;cus_8f2&quot;</span>,</p>
              <p className="pl-4">amount: <span className="font-semibold">4200</span></p>
              <p>{"}"})</p>
            </div>
          ),
        },
        {
          value: "deploy",
          label: "Deploy",
          icon: <Rocket />,
          title: "Preview every pull request.",
          description: "Each push gets its own URL, build log and performance report before it ever reaches production.",
          points: ["Unique preview URLs", "One-click rollback"],
          link: { label: "Read the deploy guide", href: "#" },
          visual: (
            <div className={card}>
              <p className="font-semibold">✓ Build passed</p>
              <p className="mt-2">pr-482.preview.acme.dev</p>
              <p className="text-muted-foreground mt-2">LCP 1.1s · CLS 0.00</p>
            </div>
          ),
        },
      ]}
    />
  )
}
