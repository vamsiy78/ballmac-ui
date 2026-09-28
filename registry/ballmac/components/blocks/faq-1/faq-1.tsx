// Ballmac UI: FAQ 1. https://ui.ballmac.com/blocks/faq-1
import * as React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"
import { cn } from "@/lib/utils"

type Faq = { question: string; answer: string }

type Faq1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title?: string
  /** Text under the heading, e.g. where to get more help. */
  description?: React.ReactNode
  /** Questions and answers. */
  items?: Faq[]
}

const defaults: Faq[] = [
  { question: "Is there a free plan?", answer: "Yes. The Hobby plan is free forever for personal projects, with no credit card required." },
  { question: "Can I change plans later?", answer: "Anytime. Upgrades take effect immediately; downgrades apply at the end of your billing period." },
  { question: "Do you offer refunds?", answer: "If you're not happy within 14 days of upgrading, contact support for a full refund." },
  { question: "Where is my data stored?", answer: "In the region you choose when you create a project. You can export everything at any time." },
  { question: "Do you support single sign-on?", answer: "SAML SSO is available on the Pro plan and above." },
]

function Faq1({
  title = "Frequently asked questions",
  description = "Can't find what you're looking for? Contact our support team.",
  items = defaults,
  className,
  ...props
}: Faq1Props) {
  return (
    <section data-slot="faq-1" className={cn("mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1fr_1.6fr]", className)} {...props}>
      <div>
        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{title}</h2>
        <p className="mt-4 text-muted-foreground">{description}</p>
      </div>
      <Accordion type="single" collapsible defaultValue="item-0">
        {items.map((item, i) => (
          <AccordionItem key={item.question} value={`item-${i}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export { Faq1, type Faq1Props }
