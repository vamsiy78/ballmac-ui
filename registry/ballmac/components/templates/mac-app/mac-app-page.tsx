// Ballmac UI: Mac app template. https://ui.ballmac.com/templates/template-mac-app
import { Cta2 } from "@/components/ballmac/blocks/cta-2/cta-2"
import { Faq1 } from "@/components/ballmac/blocks/faq-1/faq-1"
import { Features4 } from "@/components/ballmac/blocks/features-4/features-4"
import { Footer1 } from "@/components/ballmac/blocks/footer-1/footer-1"
import { Header1 } from "@/components/ballmac/blocks/header-1/header-1"
import { Hero5 } from "@/components/ballmac/blocks/hero-5/hero-5"
import { LogoCloud1 } from "@/components/ballmac/blocks/logo-cloud-1/logo-cloud-1"
import { Pricing1 } from "@/components/ballmac/blocks/pricing-1/pricing-1"
import { Testimonials1 } from "@/components/ballmac/blocks/testimonials-1/testimonials-1"

/**
 * A complete landing page for a Mac app. Every section is a Ballmac block with its own props:
 * edit the copy here, reorder sections, or swap a block for another one in the same category.
 */
function MacAppPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header1
        brand="Acme Tasks"
        links={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ]}
        secondaryAction={{ label: "Support", href: "#" }}
        primaryAction={{ label: "Download", href: "#" }}
      />
      <main>
        <Hero5 />
        <LogoCloud1 title="Loved by people who plan at" />
        <Features4 id="features" />
        <Testimonials1 />
        <Pricing1
          id="pricing"
          title="Try it free. Buy it once."
          description="No subscription. One purchase covers every Mac you own, with updates for the whole major version."
          plans={[
            {
              name: "Free",
              price: "$0",
              description: "Everything you need for one list.",
              features: [
                { label: "Unlimited tasks", included: true },
                { label: "Menu bar companion", included: true },
                { label: "Keyboard shortcuts", included: true },
                { label: "iCloud sync", included: false },
                { label: "Multiple lists and tags", included: false },
              ],
              cta: { label: "Download free", href: "#" },
            },
            {
              name: "Pro",
              price: "$19",
              period: "one-time",
              description: "For planning your whole life, on every device.",
              features: [
                { label: "Unlimited tasks", included: true },
                { label: "Menu bar companion", included: true },
                { label: "Keyboard shortcuts", included: true },
                { label: "iCloud sync", included: true },
                { label: "Multiple lists and tags", included: true },
              ],
              cta: { label: "Buy Pro", href: "#" },
              featured: true,
            },
          ]}
          note="Prices in USD. 14-day refunds, no questions asked."
        />
        <Faq1
          id="faq"
          items={[
            { question: "Which Macs are supported?", answer: "Any Mac running macOS 14 Sonoma or later, with Apple silicon or Intel." },
            { question: "Do I need an account?", answer: "No. Tasks stay on your Mac, and sync through your own iCloud account if you turn it on." },
            { question: "Is Pro a subscription?", answer: "No. Pro is a one-time purchase that includes updates for the current major version." },
            { question: "Can I move my license to a new Mac?", answer: "Yes. Deactivate it on the old Mac from Settings, then activate it on the new one." },
          ]}
        />
        <Cta2 eyebrow="Coming to iPhone" title="Get the iPhone app first." description="Join the beta list and we'll email you a TestFlight invite." buttonLabel="Join the beta" />
      </main>
      <Footer1 brand="Acme Tasks" tagline="A calm to-do app for the Mac." />
    </div>
  )
}

export { MacAppPage }
