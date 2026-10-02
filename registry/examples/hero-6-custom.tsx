import { Bell, ShieldCheck } from "lucide-react"

import { Hero6, Hero6Float } from "@/components/ballmac/blocks/hero-6/hero-6"

const card = "bg-card/90 flex items-center gap-3 rounded-2xl border p-4 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.4)] backdrop-blur-xl"

export default function Hero6Custom() {
  return (
    <Hero6
      eyebrow="Security, built in"
      title="Protect every login without"
      highlight="slowing anyone down."
      description="Passkeys, risk-based prompts and instant device approval. Your team signs in faster than before and your audit log gets better."
      primaryAction={{ label: "Try it free", href: "#" }}
      secondaryAction={{ label: "Read the docs", href: "#" }}
      highlights={["Passkeys ready", "SAML and SCIM", "99.99% uptime"]}
      cards={
        <>
          <Hero6Float depth={24} className="xl:top-[52%] xl:start-[2%]">
            <div className={`${card} w-full xl:w-64`}>
              <span className="bg-chart-2/15 text-chart-2 flex size-10 shrink-0 items-center justify-center rounded-xl" aria-hidden="true">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">Sign-in verified</p>
                <p className="text-muted-foreground text-xs">Passkey · Lisbon, PT</p>
              </div>
            </div>
          </Hero6Float>
          <Hero6Float depth={30} delay={1} className="xl:end-[2%] xl:bottom-[12%]">
            <div className={`${card} w-full xl:w-64`}>
              <span className="bg-chart-3/15 text-chart-3 flex size-10 shrink-0 items-center justify-center rounded-xl" aria-hidden="true">
                <Bell className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">New device request</p>
                <p className="text-muted-foreground text-xs">Approve from your phone</p>
              </div>
            </div>
          </Hero6Float>
        </>
      }
    />
  )
}
