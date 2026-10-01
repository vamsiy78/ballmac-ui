import { SummitSchedule } from "@/components/ballmac/templates/summit/summit-schedule"

export default function TemplateSummitSchedule() {
  return (
    <SummitSchedule
      hrefs={{ home: "/preview/template-summit-demo", schedule: "/preview/template-summit-schedule", speakers: "/preview/template-summit-speakers", tickets: "/preview/template-summit-tickets", venue: "/preview/template-summit-venue" }}
    />
  )
}
