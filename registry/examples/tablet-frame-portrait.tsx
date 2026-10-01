import { Bookmark, ChevronLeft, Share, Type } from "lucide-react"

import { TabletFrame } from "@/components/ballmac/tablet-frame"

function Reader() {
  return (
    <div className="flex h-full flex-col bg-[color-mix(in_oklch,var(--chart-3)_8%,var(--background))] px-16 pt-6 text-[22px]">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-foreground"><ChevronLeft className="size-7" aria-hidden="true" /> Library</span>
        <span className="flex items-center gap-5">
          <Type className="size-7" aria-hidden="true" />
          <Bookmark className="size-7" aria-hidden="true" />
          <Share className="size-7" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-14 text-[20px] font-semibold tracking-[0.18em] text-chart-5 uppercase">Chapter 3</p>
      <h3 className="mt-3 font-serif text-[72px] leading-[1.02] font-bold tracking-tight">The long way around the lake</h3>
      <p className="mt-8 font-serif text-[31px] leading-[1.6] text-foreground/85">
        By the time the fog lifted, the ferry had already crossed twice. Maren stood at the rail with her coat buttoned to the chin, watching the far shore
        resolve from a grey smudge into a line of small, lit windows.
      </p>
      <p className="mt-6 font-serif text-[31px] leading-[1.6] text-foreground/85">
        She had promised herself she would not look at the letter again. It lay folded in her pocket, soft at the creases, as if it had already been
        read a hundred times by someone else.
      </p>
      <blockquote className="mt-10 border-l-4 border-chart-5 pl-6 font-serif text-[34px] leading-snug text-foreground italic">
        Some distances are only measured in what you chose not to say.
      </blockquote>
      <p className="mt-8 font-serif text-[31px] leading-[1.6] text-foreground/85">
        The ferry horn sounded once, low and patient, and the whole lake seemed to lean toward the sound.
      </p>
      <div className="mt-auto flex items-center gap-4 pb-10 text-[20px] text-muted-foreground">
        <span>42 of 318</span>
        <span className="h-1 flex-1 rounded-full bg-muted"><span className="block h-full w-[13%] rounded-full bg-chart-5" /></span>
        <span>13%</span>
      </div>
    </div>
  )
}

export default function TabletFramePortrait() {
  return (
    <div className="flex w-full justify-center px-2 py-6">
      <TabletFrame orientation="portrait" variant="black" screenWidth={834} className="max-w-[380px]">
        <Reader />
      </TabletFrame>
    </div>
  )
}
