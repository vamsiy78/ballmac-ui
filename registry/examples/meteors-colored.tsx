import { Meteors } from "@/components/ballmac/meteors"

export default function MeteorsColored() {
  return (
    <div className="relative isolate flex h-64 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border bg-background">
      <Meteors count={22} angle={110} color="var(--chart-1)" duration={[1.6, 3.6]} className="-z-10" />
      <p className="text-3xl font-semibold tracking-tight">Make a wish.</p>
    </div>
  )
}
