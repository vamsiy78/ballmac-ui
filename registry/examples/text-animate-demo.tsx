import { TextAnimate } from "@/components/ballmac/text-animate"

export default function TextAnimateDemo() {
  return (
    <div className="grid max-w-xl gap-3 text-center">
      <TextAnimate as="h2" by="word" animation="blurIn" inView={false} className="text-4xl font-semibold tracking-tight text-foreground">
        Design systems that feel alive
      </TextAnimate>
      <TextAnimate by="line" animation="slideUp" inView={false} delay={0.5} className="text-base text-muted-foreground">
        {"Each line arrives on its own.\nNothing moves if you prefer it that way."}
      </TextAnimate>
    </div>
  )
}
