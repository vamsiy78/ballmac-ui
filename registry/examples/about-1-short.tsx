"use client"

import { About1 } from "@/components/ballmac/blocks/about-1/about-1"

/** Every part is optional: here just a statement, the story and a quote. */
export default function About1Short() {
  return (
    <About1
      eyebrow="Our studio"
      headline="Small on purpose."
      intro="Four people, one table, and a long list of things we decided not to build."
      stats={[]}
      values={[]}
      milestones={[]}
      cta={null}
      story={["We are a design and engineering studio in Porto. We take on three projects a year, and we stay with each one until it is finished.", "That is the whole business model. It is not very exciting, and it has worked for eleven years."]}
      quote={{ text: "We would rather do three projects well than ten projects quickly.", name: "Theo Nakamura", role: "Founder" }}
    />
  )
}
