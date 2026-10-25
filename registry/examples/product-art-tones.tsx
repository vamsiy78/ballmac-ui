import { ProductArt } from "@/components/ballmac/product-art"

export default function ProductArtTones() {
  return (
    <ul className="grid w-full max-w-2xl grid-cols-5 gap-3">
      {([1, 2, 3, 4, 5] as const).map((t) => (
        <li key={t}>
          <ProductArt kind="speaker" tone={t} label={`Speaker in tone ${t}`} />
        </li>
      ))}
    </ul>
  )
}
