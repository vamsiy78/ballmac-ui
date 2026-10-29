"use client"

import { ArrowRight } from "lucide-react"
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react"
import * as React from "react"

import Link from "@/components/site/link"
import { cn } from "@/lib/utils"

type Part = { text: string; accent?: boolean }

/**
 * The pitch, read at the visitor's pace: a tall dark section whose statement stays pinned while each word lights from dim to full as the page scrolls,
 * then the button arrives. The whole sentence is real text from the start (screen readers and search read it at once); only its opacity is scrubbed.
 * With less motion asked for, it is a normal section with the text fully lit.
 */
export function Manifesto({ parts, href, cta }: { parts: Part[]; href: string; cta: string }) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  // How far through the pinned stretch the page is, 0 to 1, read straight from the section's box on every scroll and resize.
  const scrollYProgress = useMotionValue(0)
  React.useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    let frame = 0
    const read = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const span = r.height - window.innerHeight
      scrollYProgress.set(span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1)
    }
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener("scroll", queue, { passive: true })
    window.addEventListener("resize", queue)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", queue)
      window.removeEventListener("resize", queue)
    }
  }, [reduce, scrollYProgress])
  const words = parts.flatMap((p) => p.text.split(" ").filter(Boolean).map((w) => ({ w, accent: p.accent })))
  const ctaOpacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1])
  const ctaY = useTransform(scrollYProgress, [0.82, 0.95], [16, 0])

  return (
    <section ref={ref} aria-labelledby="pitch-h" className={cn("bm-grain dark relative isolate bg-[oklch(0.135_0.006_265)] text-white", reduce ? "" : "h-[220vh]")}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,oklch(0.8_0.09_70/0.16),transparent_70%)]" />
      <div className={cn("mx-auto flex max-w-[1200px] flex-col justify-center px-5 sm:px-6", reduce ? "py-28" : "sticky top-0 h-svh")}>
        <h2 id="pitch-h" className="text-[2.1rem] leading-[1.12] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.4rem]">
          {words.map((x, i) => (
            <React.Fragment key={i}>
              <Word progress={scrollYProgress} range={[(i / words.length) * 0.8, ((i + 1) / words.length) * 0.8]} still={!!reduce} accent={x.accent}>
                {x.w}
              </Word>{" "}
            </React.Fragment>
          ))}
        </h2>
        <motion.div style={reduce ? undefined : { opacity: ctaOpacity, y: ctaY }} className="mt-12">
          <Link href={href} className="bm-sheen relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-7 text-[15px] font-semibold text-black shadow-[0_10px_40px_-8px_oklch(0.82_0.12_75/0.55)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-white/60 motion-reduce:transition-none">
            {cta} <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function Word({ progress, range, still, accent, children }: { progress: MotionValue<number>; range: [number, number]; still: boolean; accent?: boolean; children: React.ReactNode }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <motion.span style={still ? undefined : { opacity }} className={cn(accent && "text-[oklch(0.83_0.15_78)]")}>
      {children}
    </motion.span>
  )
}
