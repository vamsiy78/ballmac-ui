import { SmoothCursor } from "@/components/ballmac/smooth-cursor"

export default function SmoothCursorCustom() {
  return (
    <SmoothCursor
      stiffness={260}
      cursor={<span className="block size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-foreground/10 backdrop-blur-sm" />}
      className="flex h-56 w-full max-w-md items-center justify-center rounded-2xl border bg-card"
    >
      <p className="pointer-events-none text-center text-sm text-muted-foreground">A floaty ring instead of an arrow.</p>
    </SmoothCursor>
  )
}
