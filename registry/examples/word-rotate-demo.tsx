import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { WordRotate } from "@/components/ballmac/word-rotate"

export default function WordRotateDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center text-center">
      <span className="rounded-full border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
        v3.0 · now with branch previews
      </span>
      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">
        Ship{" "}
        <WordRotate
          words={["faster", "safer", "together"]}
          wordClassName="bg-[linear-gradient(100deg,var(--chart-1),var(--chart-4)_55%,var(--chart-5))] bg-clip-text pe-[0.04em] text-transparent"
        />
        <br />
        without the pager.
      </h1>
      <p className="mt-4 max-w-md text-balance text-muted-foreground">
        Previews, rollbacks and logs in one calm place, so releases stop being events.
      </p>
      <div className="mt-6 flex gap-3">
        <a href="#" className={buttonVariants({ shape: "pill" })}>
          Start free <ArrowRight aria-hidden="true"  className="rtl:rotate-180"/>
        </a>
        <a href="#" className={buttonVariants({ variant: "outline", shape: "pill" })}>
          Read the docs
        </a>
      </div>
    </div>
  )
}
