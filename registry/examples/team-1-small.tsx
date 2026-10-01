import { Globe, Mail } from "lucide-react"

import { Team1 } from "@/components/ballmac/blocks/team-1/team-1"

export default function Team1Small() {
  return (
    <Team1
      eyebrow="Leadership"
      title="Meet the leadership team."
      description="Four people who set the direction and answer your emails."
      action={null}
      members={[
        { name: "Priya Raman", role: "CEO", location: "Lisbon", bio: "Leads strategy and talks to customers every week.", links: [{ label: "Email Priya", href: "#", icon: <Mail /> }, { label: "Priya’s website", href: "#", icon: <Globe /> }] },
        { name: "Marcus Webb", role: "CTO", location: "Austin", bio: "Owns architecture, reliability and the on-call rota.", links: [{ label: "Email Marcus", href: "#", icon: <Mail /> }] },
        { name: "Elena Fischer", role: "Design", location: "Berlin", bio: "Keeps the product calm, consistent and kind.", links: [{ label: "Email Elena", href: "#", icon: <Mail /> }] },
        { name: "Tomás Herrera", role: "Customer Success", location: "Mexico City", bio: "Makes sure no question goes unanswered.", links: [{ label: "Email Tomás", href: "#", icon: <Mail /> }] },
      ]}
    />
  )
}
