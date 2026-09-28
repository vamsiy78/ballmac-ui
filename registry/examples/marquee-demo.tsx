import { Marquee } from "@/components/ballmac/marquee"

const logos = ["Northwind", "Acme", "Lumen", "Halcyon", "Meridian", "Parallax", "Quanta", "Tessellate"]

export default function MarqueeDemo() {
  return (
    <div className="w-full max-w-2xl">
      <p className="mb-4 text-center font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Trusted by product teams
      </p>
      <Marquee gap={40}>
        {logos.map((name) => (
          <span key={name} className="flex items-center gap-2 text-lg font-semibold tracking-tight text-muted-foreground">
            <span aria-hidden="true" className="size-4 rounded-sm border border-foreground/30 bg-muted" />
            {name}
          </span>
        ))}
      </Marquee>
    </div>
  )
}
