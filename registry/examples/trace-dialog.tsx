import { ChevronRight, Search } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ballmac/dialog"
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ballmac/trace"

/** A line that opens a dialog: wrap the TraceLine in the dialog's own trigger, and the dialog keeps its focus handling. */
export default function TraceDialog() {
  return (
    <Trace className="w-full max-w-md">
      <Dialog>
        <DialogTrigger>
          <TraceLine>
            <TraceIcon>
              <Search />
            </TraceIcon>
            <TraceTitle>Searched the web for cache keys</TraceTitle>
            <TraceIcon>
              <ChevronRight className="rtl:rotate-180" />
            </TraceIcon>
          </TraceLine>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Searched the web for cache keys</DialogTitle>
          <DialogDescription>Three queries, eleven results read.</DialogDescription>
          <ul className="list-disc space-y-1 ps-5 text-sm">
            <li>cache key strategies for static builds</li>
            <li>content hash vs version in the key</li>
            <li>invalidate a CDN cache on deploy</li>
          </ul>
        </DialogContent>
      </Dialog>
    </Trace>
  )
}
