import Image from "next/image"

import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

export type FanCard = { name: string; title: string; src: string; pro: boolean }

/** Three whole templates fanned out: the middle one forward and larger, the two beside it lower and turned a little away. On a phone they stack. */
export function TemplateFan({ cards }: { cards: [FanCard, FanCard, FanCard] }) {
  const place = [
    "sm:mt-12 sm:-rotate-[4deg] sm:origin-bottom-right",
    "z-10 sm:scale-[1.08]",
    "sm:mt-12 sm:rotate-[4deg] sm:origin-bottom-left",
  ]
  return (
    <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-[1fr_1.25fr_1fr] sm:items-start sm:gap-5">
      {cards.map((c, i) => (
        <li key={c.name} className={cn("bm-reveal transition-transform duration-500 motion-reduce:transition-none", place[i])}>
          <Link href={`/templates/${c.name}`} className="group focus-visible:ring-ring/50 block rounded-[2rem] outline-none focus-visible:ring-[3px]">
            <span className="bg-frame relative block overflow-hidden rounded-[2rem] p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)]">
              <span className="relative block aspect-[800/525] overflow-hidden rounded-[1.6rem]">
                {(["light", "dark"] as const).map((mode) => (
                  <Image key={mode} src={`${c.src}.${mode}.webp`} alt={mode === "light" ? `${c.title} template` : ""} width={800} height={525} unoptimized loading="lazy" className={cn("absolute inset-0 size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100", mode === "light" ? "dark:hidden" : "hidden dark:block")} />
                ))}
              </span>
            </span>
            <span className="mt-3 flex items-center justify-center gap-2 text-sm">
              <span className="font-medium">{c.title}</span>
              <span className="text-muted-foreground text-xs">{c.pro ? "Pro" : "Free"}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
