import { Careers1 } from "@/components/ballmac/blocks/careers-1/careers-1"

export default function Careers1Small() {
  return (
    <Careers1
      eyebrow="Join us"
      title="Two roles, one mission."
      description="We are growing carefully. Here is where we need help right now."
      perks={[]}
      jobs={[
        { title: "Founding Engineer", team: "Engineering", location: "Remote (anywhere)", type: "Full-time", href: "#" },
        { title: "Developer Advocate", team: "Community", location: "Remote (anywhere)", type: "Full-time", href: "#" },
      ]}
    />
  )
}
