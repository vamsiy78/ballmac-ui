// Ballmac UI: Product Art. https://ui.ballmac.com/components/product-art
import * as React from "react"

import { cn } from "@/lib/utils"

type ProductArtKind = "speaker" | "mug" | "bag" | "lamp" | "bottle" | "headphones"
type ProductArtTone = 1 | 2 | 3 | 4 | 5

type ProductArtProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Which object to draw. */
  kind: ProductArtKind
  /** Which chart color tints the background and the object. */
  tone?: ProductArtTone
  /** Describes the product for screen readers. Leave it out when the name is written beside the picture. */
  label?: string
}

const SHAPES: Record<ProductArtKind, React.ReactNode> = {
  speaker: (
    <>
      <rect x="62" y="34" width="76" height="132" rx="18" fill="currentColor" opacity="0.9" />
      <circle cx="100" cy="76" r="17" fill="var(--card)" opacity="0.9" />
      <circle cx="100" cy="76" r="7" fill="currentColor" opacity="0.55" />
      <circle cx="100" cy="128" r="25" fill="var(--card)" opacity="0.9" />
      <circle cx="100" cy="128" r="12" fill="currentColor" opacity="0.55" />
    </>
  ),
  mug: (
    <>
      <path d="M58 64h72v68a24 24 0 0 1-24 24H82a24 24 0 0 1-24-24V64Z" fill="currentColor" opacity="0.9" />
      <path d="M130 80h12a18 18 0 0 1 0 36h-12" fill="none" stroke="currentColor" strokeWidth="11" opacity="0.9" />
      <ellipse cx="94" cy="64" rx="36" ry="7" fill="var(--card)" opacity="0.55" />
    </>
  ),
  bag: (
    <>
      <path d="M52 78h96l9 84a10 10 0 0 1-10 11H53a10 10 0 0 1-10-11l9-84Z" fill="currentColor" opacity="0.9" />
      <path d="M76 78V66a24 24 0 0 1 48 0v12" fill="none" stroke="currentColor" strokeWidth="9" opacity="0.9" />
      <rect x="86" y="108" width="28" height="20" rx="5" fill="var(--card)" opacity="0.7" />
    </>
  ),
  lamp: (
    <>
      <path d="M70 40h60l22 62H48l22-62Z" fill="currentColor" opacity="0.9" />
      <rect x="96" y="102" width="8" height="52" fill="currentColor" opacity="0.7" />
      <ellipse cx="100" cy="162" rx="30" ry="7" fill="currentColor" opacity="0.9" />
      <path d="M70 40h60" stroke="var(--card)" strokeWidth="3" opacity="0.5" />
    </>
  ),
  bottle: (
    <>
      <rect x="88" y="28" width="24" height="20" rx="5" fill="currentColor" opacity="0.7" />
      <path d="M84 48h32l8 22v84a14 14 0 0 1-14 14H90a14 14 0 0 1-14-14V70l8-22Z" fill="currentColor" opacity="0.9" />
      <rect x="82" y="96" width="36" height="34" rx="6" fill="var(--card)" opacity="0.8" />
    </>
  ),
  headphones: (
    <>
      <path d="M52 112V96a48 48 0 0 1 96 0v16" fill="none" stroke="currentColor" strokeWidth="10" opacity="0.9" strokeLinecap="round" />
      <rect x="40" y="104" width="30" height="52" rx="14" fill="currentColor" opacity="0.9" />
      <rect x="130" y="104" width="30" height="52" rx="14" fill="currentColor" opacity="0.9" />
      <rect x="47" y="114" width="12" height="32" rx="6" fill="var(--card)" opacity="0.5" />
      <rect x="141" y="114" width="12" height="32" rx="6" fill="var(--card)" opacity="0.5" />
    </>
  ),
}

/**
 * A soft square with a simple object drawn in a chart color, for product grids and detail pages before real photos exist (or as the fallback when one fails
 * to load). It uses theme tokens only, fills whatever width it is given, and is hidden from screen readers unless it has a label.
 */
function ProductArt({ kind, tone = 1, label, className, style, ...props }: ProductArtProps) {
  return (
    <div
      data-slot="product-art"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative aspect-square w-full overflow-hidden rounded-xl", className)}
      style={{ background: `color-mix(in oklch, var(--chart-${tone}) 16%, var(--card))`, color: `color-mix(in oklch, var(--chart-${tone}) 78%, var(--foreground))`, ...style }}
      {...props}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden="true">
        <ellipse cx="100" cy="172" rx="52" ry="7" fill="currentColor" opacity="0.14" />
        {SHAPES[kind]}
      </svg>
    </div>
  )
}

export { ProductArt, type ProductArtKind, type ProductArtProps, type ProductArtTone }
