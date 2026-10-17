import { CoverArt } from "@/components/ballmac/cover-art"

const names = ["Launch", "Design", "Billing", "Support", "Research", "Hiring", "Docs", "Ops"]

/** The same seed gives the same picture every time, so a name is enough to make a set of avatars. */
export default function CoverArtSeeds() {
  return (
    <ul className="flex max-w-md flex-wrap justify-center gap-3">
      {names.map((name) => (
        <li key={name} className="grid justify-items-center gap-1.5">
          <CoverArt seed={name} variant="mesh" className="size-14 rounded-2xl border" />
          <span className="text-xs">{name}</span>
        </li>
      ))}
    </ul>
  )
}
