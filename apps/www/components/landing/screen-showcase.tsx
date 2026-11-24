import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

export type Showcase = { name: string; title: string; note: string; pro: boolean; alt: string }

/**
 * Whole app screens, shown whole: full captures at 2560 wide in their own aspect, never cropped, so the words in them stay readable. Each sits
 * in a warm frame with a quiet title bar, and opens the screen's page.
 */
export function ScreenShowcase({ screens }: { screens: Showcase[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {screens.map((s, i) => (
        <li key={s.name} className="bm-reveal min-w-0">
          <Link href={`/blocks/${s.name}`} className="group bg-frame focus-visible:ring-ring/50 block rounded-[1.75rem] p-2.5 outline-none transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)] focus-visible:ring-[3px] motion-reduce:transition-none">
            <span className="bg-background block overflow-hidden rounded-[1.25rem] ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
              <span className="flex h-8 items-center gap-1.5 border-b px-3.5" aria-hidden="true">
                <span className="bg-foreground/15 size-2 rounded-full" />
                <span className="bg-foreground/15 size-2 rounded-full" />
                <span className="bg-foreground/15 size-2 rounded-full" />
                <span className="text-muted-foreground ms-auto min-w-0 truncate font-mono text-[11px]">@ballmac/{s.name}</span>
              </span>
              <span className="block p-3 sm:p-4">
              <span className="relative block aspect-[16/10] overflow-hidden rounded-md">
                {(["light", "dark"] as const).map((mode) => (
                  <Image
                    key={mode}
                    src={`/home/screens/${s.name}.${mode}.webp`}
                    alt={mode === "light" ? s.alt : ""}
                    width={2560}
                    height={1600}
                    unoptimized
                    loading={i < 2 ? "eager" : "lazy"}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className={cn("absolute inset-0 size-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100", mode === "light" ? "dark:hidden" : "hidden dark:block")}
                  />
                ))}
              </span>
              </span>
            </span>
            <span className="flex items-center justify-between gap-3 px-2 pt-3 pb-1.5">
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium tracking-[-0.01em]">{s.title}</span>
                <span className="text-muted-foreground block truncate text-[13px]">{s.note}</span>
              </span>
              <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
                {s.pro ? "Pro" : "Free"}
                <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
