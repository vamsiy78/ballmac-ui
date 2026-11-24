import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

/** `dark` shows the dark capture in both site modes, so the grid alternates light and dark tiles. */
export type BentoScreen = { name: string; title: string; href: string; pro: boolean; src: string; alt: string; width: number; height: number; dark?: boolean }

/** Where each of the eight tiles sits in the four-column grid: a rhythm of small, wide and tall tiles rather than a uniform wall. */
const SPANS = ["lg:col-span-1", "lg:col-span-2", "lg:col-span-1 lg:row-span-2", "lg:col-span-2", "lg:col-span-1", "lg:col-span-2", "lg:col-span-2 lg:row-span-2", "lg:col-span-2"]

function Shot({ s, priority }: { s: BentoScreen; priority?: boolean }) {
  return (
    <>
      {(s.dark ? (["dark"] as const) : (["light", "dark"] as const)).map((mode) => (
        <Image
          key={mode}
          src={`${s.src}.${mode}.webp`}
          alt={mode === "light" || s.dark ? s.alt : ""}
          width={s.width}
          height={s.height}
          unoptimized
          loading={priority ? "eager" : "lazy"}
          className={cn("absolute inset-0 size-full object-cover object-left-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100", s.dark ? "" : mode === "light" ? "dark:hidden" : "hidden dark:block")}
        />
      ))}
    </>
  )
}

/** Real screens in warm frames, each a link to its own page, with its name and whether it is free underneath. */
export function ScreenBento({ screens }: { screens: BentoScreen[] }) {
  return (
    <ul className="grid auto-rows-[15rem] grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-[17.5rem] lg:grid-cols-4">
      {screens.slice(0, 8).map((s, i) => (
        <li key={s.name} className={cn("bm-reveal min-w-0", SPANS[i], i === 2 || i === 6 ? "sm:row-span-2" : "")}>
          <Link
            href={s.href}
            className="group bg-frame focus-visible:ring-ring/50 flex h-full flex-col rounded-[1.75rem] p-2.5 outline-none transition-shadow hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)] focus-visible:ring-[3px] motion-reduce:transition-none"
          >
            <span className={cn("relative block min-h-0 flex-1 overflow-hidden rounded-[1.25rem] ring-1 ring-black/[0.05] dark:ring-white/[0.06]", s.dark ? "bg-[oklch(0.17_0_0)]" : "bg-background")}>
              <Shot s={s} priority={i < 3} />
              <span className={cn("absolute end-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-md", s.pro ? "bg-foreground/85 text-background" : "bg-[oklch(0.5_0.2_258)] text-white")}>{s.pro ? "Pro" : "Free"}</span>
            </span>
            <span className="flex items-center justify-between gap-3 px-2 pt-2.5 pb-1">
              <span className="truncate text-[15px] font-medium tracking-[-0.01em]">{s.title}</span>
              <span className="text-muted-foreground flex shrink-0 items-center gap-1 font-mono text-xs">
                {s.name}
                <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" aria-hidden="true" />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
