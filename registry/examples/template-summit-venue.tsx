import { SummitVenue } from "@/components/ballmac/templates/summit/summit-venue"

export default function TemplateSummitVenue() {
  return (
    <SummitVenue
      hrefs={{ home: "/preview/template-summit-demo", schedule: "/preview/template-summit-schedule", speakers: "/preview/template-summit-speakers", tickets: "/preview/template-summit-tickets", venue: "/preview/template-summit-venue" }}
    />
  )
}
