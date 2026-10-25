import { ProductArt } from "@/components/ballmac/product-art"

const kinds = ["speaker", "mug", "bag", "lamp", "bottle", "headphones"] as const

export default function ProductArtDemo() {
  return (
    <ul className="grid w-full max-w-2xl grid-cols-3 gap-4">
      {kinds.map((k, i) => (
        <li key={k} className="grid gap-2 text-center text-sm">
          <ProductArt kind={k} tone={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5} />
          <span className="text-muted-foreground">{k}</span>
        </li>
      ))}
    </ul>
  )
}
