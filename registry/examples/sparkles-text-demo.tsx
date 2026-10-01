import { SparklesText } from "@/components/ballmac/sparkles-text"

export default function SparklesTextDemo() {
  return (
    <h2 className="text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
      Meet the new <SparklesText count={10}>Pro plan</SparklesText>
    </h2>
  )
}
