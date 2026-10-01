import { GridPattern } from "@/components/ballmac/grid-pattern"

export default function GridPatternDemo() {
  return (
    <div className="relative flex h-72 w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border bg-background">
      <GridPattern
        cell={36}
        squares={[
          [4, 2],
          [6, 4],
          [9, 1],
          [11, 5],
          [2, 5],
        ]}
        fade="radial"
      />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight">Structure, quietly</h3>
        <p className="mt-1 text-sm text-muted-foreground">A grid that fades out before it gets in the way.</p>
      </div>
    </div>
  )
}
