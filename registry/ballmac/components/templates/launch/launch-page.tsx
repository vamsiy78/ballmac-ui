// Ballmac UI: Launch template. https://ui.ballmac.com/templates/template-launch
import { Cta1 } from "@/components/ballmac/blocks/cta-1/cta-1"
import { Faq1 } from "@/components/ballmac/blocks/faq-1/faq-1"
import { Features1 } from "@/components/ballmac/blocks/features-1/features-1"
import { Footer1 } from "@/components/ballmac/blocks/footer-1/footer-1"
import { Header1 } from "@/components/ballmac/blocks/header-1/header-1"
import { Hero1 } from "@/components/ballmac/blocks/hero-1/hero-1"
import { Pricing1 } from "@/components/ballmac/blocks/pricing-1/pricing-1"

/**
 * A complete product launch page. Every section is a Ballmac block with its own props:
 * edit the copy here, reorder sections, or swap a block for another one in the same category.
 */
function LaunchPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header1 />
      <main>
        <Hero1 />
        <Features1 />
        <Pricing1 />
        <Faq1 />
        <Cta1 />
      </main>
      <Footer1 />
    </div>
  )
}

export { LaunchPage }
