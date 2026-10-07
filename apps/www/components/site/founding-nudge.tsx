import { Clock } from "lucide-react"

import Link from "@/components/site/link"

/** One true line about the founding price, linking to the offer. Shown where someone is looking at a Pro block. `text` comes from nudgeText on the server. */
export function FoundingNudge({ text }: { text: string }) {
  return (
    <Link href="/pricing#plans" className="bg-muted/60 hover:bg-muted focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]">
      <Clock className="size-3.5" aria-hidden="true" />
      {text}
    </Link>
  )
}
