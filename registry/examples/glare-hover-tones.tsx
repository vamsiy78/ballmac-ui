import { GlareHover } from "@/components/ballmac/glare-hover"

export default function GlareHoverTones() {
  return (
    <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
      <GlareHover tone="light" intensity={0.7} className="rounded-xl bg-neutral-900 p-6 text-white" tabIndex={0}>
        <p className="text-sm font-semibold">Light glare</p>
        <p className="mt-1 text-xs text-neutral-300">For images and dark surfaces.</p>
      </GlareHover>
      <GlareHover tone="dark" intensity={0.8} className="rounded-xl border bg-card p-6" tabIndex={0}>
        <p className="text-sm font-semibold">Dark glare</p>
        <p className="mt-1 text-xs text-muted-foreground">A soft shadow band for light cards.</p>
      </GlareHover>
    </div>
  )
}
