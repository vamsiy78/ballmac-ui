import { Pricing2 } from "@/components/ballmac/blocks/pricing-2/pricing-2"

export default function Pricing2Custom() {
  return (
    <Pricing2
      title="Pay for what you ship."
      description="Every plan includes unlimited collaborators."
      defaultInterval="monthly"
      discountLabel="2 months free"
      currency="EUR"
      enterprise={null}
      note="Prices in EUR, excluding VAT."
      plans={[
        {
          name: "Solo",
          description: "One maker, one product.",
          price: { monthly: 9, yearly: 7 },
          unit: "per month",
          features: ["1 project", "Custom domain", "Email support"],
          cta: { label: "Get Solo", href: "#" },
        },
        {
          name: "Studio",
          description: "For small teams and agencies.",
          price: { monthly: 29, yearly: 24 },
          unit: "per month",
          lead: "Everything in Solo, plus:",
          features: ["Unlimited projects", "Client access", "White-label reports"],
          cta: { label: "Get Studio", href: "#" },
          featured: true,
        },
        {
          name: "Agency",
          description: "For larger portfolios.",
          price: "Custom",
          lead: "Everything in Studio, plus:",
          features: ["Dedicated manager", "Priority roadmap", "Invoice billing"],
          cta: { label: "Contact us", href: "#" },
        },
      ]}
    />
  )
}
