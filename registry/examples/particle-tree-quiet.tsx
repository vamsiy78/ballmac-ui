import { ParticleTree } from "@/components/ballmac/particle-tree"

export default function ParticleTreeQuiet() {
  return (
    <div className="relative isolate h-[360px] w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <ParticleTree className="-z-10" density={0.6} seed={21} accent="--foreground" rings={false} radius={0} />
    </div>
  )
}
