import { Pricing3 } from "@/components/ballmac/blocks/pricing-3/pricing-3"

export default function Pricing3Two() {
  return (
    <Pricing3
      title="Free or Pro?"
      description="Here is exactly what changes when you upgrade."
      plans={[
        { key: "free", name: "Free", price: "$0", period: "forever", cta: { label: "Get started", href: "#" } },
        { key: "pro", name: "Pro", price: "$18", period: "per month", cta: { label: "Upgrade", href: "#" }, featured: true },
      ]}
      groups={[
        {
          title: "Editor",
          rows: [
            { label: "Documents", values: { free: "25", pro: "Unlimited" } },
            { label: "Templates", values: { free: "Basic", pro: "All 400+" } },
            { label: "AI writing assistant", hint: "Drafts, rewrites and summaries", values: { free: false, pro: true } },
          ],
        },
        {
          title: "Sharing",
          rows: [
            { label: "Public links", values: { free: true, pro: true } },
            { label: "Password protection", values: { free: false, pro: true } },
            { label: "Remove branding", values: { free: false, pro: true } },
          ],
        },
      ]}
    />
  )
}
