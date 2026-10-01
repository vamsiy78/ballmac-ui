import { Highlighter } from "@/components/ballmac/highlighter"

export default function HighlighterDemo() {
  return (
    <p className="max-w-md text-lg leading-10 text-foreground">
      The fastest way to ship a good interface is to <Highlighter action="highlight" tone="chart-3" inView={false}>start from components</Highlighter> that
      already handle <Highlighter action="underline" tone="chart-1" inView={false} delay={0.5}>keyboard and screen readers</Highlighter>, then{" "}
      <Highlighter action="circle" tone="destructive" inView={false} delay={1} padding={8}>
        change only what you must
      </Highlighter>
      .
    </p>
  )
}
