import { KeyRound, Lock, ScrollText, ShieldCheck } from "lucide-react"

import { BentoCard, BentoGrid } from "@/components/ballmac/bento-grid"

function Glow({ color, at }: { color: string; at: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: `radial-gradient(60% 70% at ${at}, color-mix(in oklch, ${color} 24%, transparent), transparent)` }}
    />
  )
}

export default function BentoGridFeatures() {
  return (
    <BentoGrid columns={2} rowHeight="11rem" className="max-w-2xl">
      <BentoCard
        rowSpan={2}
        icon={<ShieldCheck />}
        title="Secure by default"
        description="Every project starts with SSO, audit logs and encrypted secrets turned on."
        background={<Glow color="var(--chart-2)" at="30% 20%" />}
      />
      <BentoCard icon={<KeyRound />} title="Passkeys" description="Sign in without passwords." background={<Glow color="var(--chart-1)" at="80% 10%" />} />
      <BentoCard icon={<ScrollText />} title="Audit log" description="Who changed what, kept for a year." background={<Glow color="var(--chart-4)" at="80% 10%" />} />
      <BentoCard
        colSpan={2}
        icon={<Lock />}
        title="Bring your own keys"
        description="Store data encrypted with keys you control, rotated on your schedule."
        href="#"
        cta="Read the security docs"
        background={<Glow color="var(--chart-5)" at="90% 0%" />}
      />
    </BentoGrid>
  )
}
