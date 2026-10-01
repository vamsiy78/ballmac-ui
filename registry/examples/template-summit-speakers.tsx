import { SummitSpeakers } from "@/components/ballmac/templates/summit/summit-speakers"

export default function TemplateSummitSpeakers() {
  return (
    <SummitSpeakers
      hrefs={{ home: "/preview/template-summit-demo", schedule: "/preview/template-summit-schedule", speakers: "/preview/template-summit-speakers", tickets: "/preview/template-summit-tickets", venue: "/preview/template-summit-venue" }}
    />
  )
}
