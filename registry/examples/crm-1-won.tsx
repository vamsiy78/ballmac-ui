"use client"

import { Crm1, type Crm1Contact } from "@/components/ballmac/blocks/crm-1/crm-1"

const contact: Crm1Contact = {
  id: "c2", name: "Daniel Okoro", title: "Controller", company: "Harbor Bank", email: "daniel@harborbank.com", phone: "+44 20 7946 0958", location: "London", owner: "Mia Laurent", stage: 4, value: 126000, tags: ["Finance", "Won"], followUp: "2026-10-30",
  activities: [
    { id: "w1", kind: "email", date: "2026-10-15", by: "Mia Laurent", summary: "Sent the signed order form and the onboarding schedule." },
    { id: "w2", kind: "meeting", date: "2026-10-12", by: "Mia Laurent", summary: "Contract review with legal. Two small wording changes, agreed the same day." },
    { id: "w3", kind: "call", date: "2026-10-02", by: "Sam Okafor", summary: "Pricing agreed at the yearly rate with a 10% launch discount." },
  ],
}

export default function Crm1Won() {
  return <Crm1 contact={contact} />
}
