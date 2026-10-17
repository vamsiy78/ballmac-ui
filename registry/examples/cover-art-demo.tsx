import { CoverArt, type CoverArtVariant } from "@/components/ballmac/cover-art"

const variants: CoverArtVariant[] = ["mesh", "rings", "bars", "dots", "waves"]

export default function CoverArtDemo() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
      {variants.map((variant, i) => (
        <figure key={variant} className="grid gap-1.5">
          <CoverArt seed={`demo-${i}`} variant={variant} grid={variant === "mesh"} className="aspect-video rounded-xl border" />
          <figcaption className="text-muted-foreground text-center text-xs">{variant}</figcaption>
        </figure>
      ))}
    </div>
  )
}
