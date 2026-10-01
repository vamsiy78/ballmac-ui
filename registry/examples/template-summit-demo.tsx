import { SummitHome } from "@/components/ballmac/templates/summit/summit-home"

export default function TemplateSummitDemo() {
  return (
    <SummitHome
      hrefs={{ home: "/preview/template-summit-demo", schedule: "/preview/template-summit-schedule", speakers: "/preview/template-summit-speakers", tickets: "/preview/template-summit-tickets", venue: "/preview/template-summit-venue" }}
    />
  )
}
