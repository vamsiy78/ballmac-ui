import { HyperText } from "@/components/ballmac/hyper-text"

export default function HyperTextDemo() {
  return (
    <div className="grid gap-4 text-center">
      <HyperText variant="tiles" className="justify-center text-3xl sm:text-4xl">
        Departures
      </HyperText>
      <HyperText variant="tiles" speed={45} className="justify-center text-xl text-foreground">
        Gate B14
      </HyperText>
    </div>
  )
}
