import { TextReveal } from "@/components/ballmac/text-reveal"

export default function TextRevealChars() {
  return (
    <div className="flex flex-col items-center gap-2 px-4 text-center">
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Release 4.2</span>
      <TextReveal as="h2" by="char" trigger="mount" className="text-4xl font-semibold tracking-tight sm:text-6xl">
        Now in beta
      </TextReveal>
    </div>
  )
}
