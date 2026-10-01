import { Stats1 } from "@/components/ballmac/blocks/stats-1/stats-1"

export default function Stats1Simple() {
  return (
    <Stats1
      eyebrow="Our community"
      title="Built in the open, used everywhere."
      description="Contributors and teams around the world rely on this project."
      link={null}
      stats={[
        { label: "GitHub stars", value: 48.2, suffix: "k", decimals: 1 },
        { label: "Contributors", value: 912 },
        { label: "Weekly downloads", value: 2.4, suffix: "M", decimals: 1 },
        { label: "Countries", value: 118 },
      ]}
    />
  )
}
