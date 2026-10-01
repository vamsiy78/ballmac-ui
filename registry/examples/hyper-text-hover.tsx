import { HyperText } from "@/components/ballmac/hyper-text"

export default function HyperTextHover() {
  return (
    <div className="grid justify-items-center gap-2">
      <HyperText trigger="hover" className="text-4xl text-foreground">
        Hover me
      </HyperText>
      <p className="text-xs text-muted-foreground">Also replays when focused with the keyboard.</p>
    </div>
  )
}
