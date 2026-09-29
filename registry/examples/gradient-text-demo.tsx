import { GradientText } from "@/components/ballmac/gradient-text"

export default function GradientTextDemo() {
  return (
    <div className="flex max-w-xl flex-col items-center text-center">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Introducing Acme 3</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
        The calm way to{" "}
        <GradientText className="pb-[0.08em]">ship software</GradientText>
      </h1>
      <p className="mt-4 max-w-sm text-balance text-muted-foreground">
        One place for previews, rollbacks and logs. No pager at 3 a.m.
      </p>
    </div>
  )
}
