import { BlurFade, BlurFadeGroup } from "@/components/ballmac/blur-fade"

export default function BlurFadeDemo() {
  return (
    <BlurFadeGroup className="grid w-full max-w-md gap-3" stagger={0.1} item={{ inView: false }}>
      <div>
        <p className="font-mono text-xs text-muted-foreground">New in 2.4</p>
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">Ship faster, with less to configure</h3>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">Everything below fades in one after the other, with a short blur that clears as each piece settles.</p>
      <div className="grid grid-cols-3 gap-2">
        {["Fast builds", "Typed APIs", "Dark mode"].map((t) => (
          <div key={t} className="rounded-lg border bg-card p-3 text-center text-sm font-medium">
            {t}
          </div>
        ))}
      </div>
      <BlurFade inView={false} delay={0.5} direction="none">
        <span className="text-xs text-muted-foreground">Stays still when reduced motion is on.</span>
      </BlurFade>
    </BlurFadeGroup>
  )
}
