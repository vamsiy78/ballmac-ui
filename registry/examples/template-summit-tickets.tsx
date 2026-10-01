import { SummitTickets } from "@/components/ballmac/templates/summit/summit-tickets"

export default function TemplateSummitTickets() {
  return (
    <SummitTickets
      hrefs={{ home: "/preview/template-summit-demo", schedule: "/preview/template-summit-schedule", speakers: "/preview/template-summit-speakers", tickets: "/preview/template-summit-tickets", venue: "/preview/template-summit-venue" }}
    />
  )
}
