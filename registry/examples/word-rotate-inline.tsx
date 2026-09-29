import { WordRotate } from "@/components/ballmac/word-rotate"

export default function WordRotateInline() {
  return (
    <p className="max-w-md text-center text-xl font-medium tracking-tight text-balance">
      Built for{" "}
      <WordRotate
        words={["designers", "engineers", "founders", "support teams"]}
        interval={2000}
        wordClassName="rounded-md bg-accent px-1.5 text-accent-foreground"
      />{" "}
      who sweat the details.
    </p>
  )
}
