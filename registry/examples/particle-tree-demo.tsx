import { ParticleTree } from "@/components/ballmac/particle-tree"

export default function ParticleTreeDemo() {
  return (
    <div className="relative isolate h-[420px] w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <ParticleTree className="-z-10" />
      <p className="absolute inset-x-0 top-8 text-center text-sm font-medium text-muted-foreground">Move the pointer through the tree</p>
    </div>
  )
}
