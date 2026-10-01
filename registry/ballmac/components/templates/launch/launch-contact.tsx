// Ballmac UI: Launch contact page. https://ui.ballmac.com/templates/template-launch
"use client"

import * as React from "react"
import { Calendar, LifeBuoy, Mail } from "lucide-react"

import { Contact1 } from "@/components/ballmac/blocks/contact-1/contact-1"
import { LaunchShell, type LaunchHrefs } from "@/components/ballmac/templates/launch/launch-theme"

type LaunchContactProps = React.ComponentProps<"div"> & { hrefs?: Partial<LaunchHrefs> }

/** The Launch contact page: Contact1 with Beacon's channels and topics. */
function LaunchContact({ hrefs, ...props }: LaunchContactProps) {
  return (
    <LaunchShell page="contact" hrefs={hrefs} {...props}>
      <main>
        <Contact1
          title="Talk to a person."
          description="Questions about plans, security or migrating from another platform? Tell us what you need and the right person will reply."
          topics={["Sales and pricing", "Security review", "Migrating to Beacon", "Support", "Something else"]}
          responseTime="We reply within one working day"
          methods={[
            { icon: <Mail />, label: "Email", value: "hello@beacon.example", href: "mailto:hello@beacon.example" },
            { icon: <Calendar />, label: "Book a demo", value: "Thirty minutes with an engineer", href: "#" },
            { icon: <LifeBuoy />, label: "Support", value: "Customers: open a ticket in the dashboard", href: "#" },
          ]}
        />
      </main>
    </LaunchShell>
  )
}

export { LaunchContact, type LaunchContactProps }
