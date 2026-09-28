import { TextReveal } from "@/components/ballmac/text-reveal"

export default function TextRevealDemo() {
  return (
    <div className="w-full max-w-xl px-4 text-center">
      <TextReveal as="h2" className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
        Interfaces that feel measured, not decorated.
      </TextReveal>
      <TextReveal as="p" delay={0.5} className="mt-4 text-sm text-muted-foreground sm:text-base">
        Motion with a purpose, tuned like an instrument.
      </TextReveal>
    </div>
  )
}
