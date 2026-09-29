import { Check } from "lucide-react"

import { Meteors } from "@/components/ballmac/meteors"

const notes = ["Offline sync across every device", "Command palette with natural search", "Up to 3× faster cold starts"]

export default function MeteorsDemo() {
  return (
    <div className="relative isolate w-full max-w-md overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 -z-10 size-80 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--chart-1)_18%,transparent),transparent)]"
      />
      <Meteors className="-z-10" />
      <span className="font-mono text-xs text-muted-foreground">v2.0 · released today</span>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight">A faster way to think.</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        The biggest update since launch, rebuilt from the storage layer up.
      </p>
      <ul className="mt-5 space-y-2.5">
        {notes.map((note) => (
          <li key={note} className="flex items-center gap-2.5 text-sm">
            <span className="flex size-5 items-center justify-center rounded-full border bg-background">
              <Check className="size-3" aria-hidden="true" />
            </span>
            {note}
          </li>
        ))}
      </ul>
      <a
        href="#"
        className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-opacity duration-150 hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Read the release notes
      </a>
    </div>
  )
}
