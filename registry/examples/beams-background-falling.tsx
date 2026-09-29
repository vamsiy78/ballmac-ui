import { BeamsBackground } from "@/components/ballmac/beams-background"

export default function BeamsBackgroundFalling() {
  return (
    <div className="relative isolate flex h-72 w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-xl border bg-card px-6 text-center">
      <BeamsBackground direction="down" colors={["--chart-2"]} gap={24} density={22} speed={1.4} className="-z-10" />
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Ingest</p>
      <h3 className="mt-2 text-3xl font-semibold tracking-tight">1.2M events a second.</h3>
    </div>
  )
}
