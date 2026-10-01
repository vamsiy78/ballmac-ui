import { LifeBuoy, Mail } from "lucide-react"

import { Contact1 } from "@/components/ballmac/blocks/contact-1/contact-1"

export default function Contact1Support() {
  return (
    <Contact1
      title="Get help from a human."
      description="Describe what you are seeing and include the steps to reproduce it. We read every message."
      topics={["Billing", "Bug report", "Account access", "Feature request"]}
      responseTime="Support replies within 2 hours on weekdays"
      methods={[
        { icon: <LifeBuoy />, label: "Help center", value: "Guides and troubleshooting", href: "#" },
        { icon: <Mail />, label: "Status updates", value: "status@acme.com", href: "mailto:status@acme.com" },
      ]}
      maxLength={1000}
    />
  )
}
