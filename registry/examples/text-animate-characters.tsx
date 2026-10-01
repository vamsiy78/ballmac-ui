import { TextAnimate, type TextAnimation } from "@/components/ballmac/text-animate"

const kinds: TextAnimation[] = ["fadeIn", "slideUp", "scaleUp", "rotateIn", "slideLeft"]

export default function TextAnimateCharacters() {
  return (
    <ul className="grid w-full max-w-sm gap-2">
      {kinds.map((animation, i) => (
        <li key={animation} className="flex items-baseline justify-between gap-4 rounded-lg border bg-card px-4 py-2.5">
          <TextAnimate by="character" animation={animation} inView={false} delay={i * 0.15} className="text-lg font-medium">
            Hello, world
          </TextAnimate>
          <span className="font-mono text-xs text-muted-foreground">{animation}</span>
        </li>
      ))}
    </ul>
  )
}
