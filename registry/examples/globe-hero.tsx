import { Globe } from "@/components/ballmac/globe"

export default function GlobeHero() {
  return (
    <div className="relative flex h-[380px] w-full max-w-2xl flex-col items-center overflow-hidden rounded-xl border bg-background px-6 pt-12 text-center">
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Edge network</span>
      <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Fast everywhere your users are.
      </h2>
      <Globe
        speed={0.002}
        theta={0.15}
        markers={[
          { location: [51.51, -0.13], size: 0.06 },
          { location: [40.71, -74.01], size: 0.06 },
          { location: [35.68, 139.69], size: 0.06 },
        ]}
        label="Globe showing three edge locations"
        className="absolute top-44 left-1/2 w-[640px] max-w-none -translate-x-1/2"
      />
    </div>
  )
}
