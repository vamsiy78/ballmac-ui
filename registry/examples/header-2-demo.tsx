import { Header2 } from "@/components/ballmac/blocks/header-2/header-2"

/** The page below the header gives the open mega menu something to float over. */
export default function Header2Demo() {
  return (
    <div className="bg-background min-h-[34rem]">
      <Header2 sticky={false} />
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="bg-muted h-3 w-40 rounded-full" />
        <div className="bg-muted mt-6 h-10 w-full max-w-xl rounded-xl" />
        <div className="bg-muted mt-3 h-10 w-full max-w-md rounded-xl" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-muted/60 h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
