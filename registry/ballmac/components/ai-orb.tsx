// Ballmac UI: AI Orb. https://ui.ballmac.com/components/ai-orb
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const orbVariants = cva("relative isolate inline-block shrink-0 rounded-full", {
  variants: {
    size: {
      sm: "size-8",
      default: "size-16",
      lg: "size-28",
      xl: "size-44",
    },
  },
  defaultVariants: { size: "default" },
})

type OrbState = "idle" | "listening" | "thinking" | "speaking"

type AiOrbProps = Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof orbVariants> & {
    /** What the assistant is doing. Each state changes how fast the colors drift and how the orb breathes. */
    state?: OrbState
    /** Live voice level from 0 to 1. While listening or speaking the orb swells with it. */
    level?: number
    /** Accessible name. Defaults to a sentence built from `state`. Pass `null` when text next to the orb already says it, which hides the orb from assistive tech. */
    label?: string | null
  }

const speeds: Record<OrbState, number> = { idle: 26, listening: 16, thinking: 6, speaking: 10 }
const breathing: Record<OrbState, { scale: number[]; duration: number }> = {
  idle: { scale: [1, 1.03, 1], duration: 5 },
  listening: { scale: [1, 1.05, 1], duration: 2.4 },
  thinking: { scale: [1, 0.96, 1], duration: 1.6 },
  speaking: { scale: [1, 1.07, 0.98, 1], duration: 1.3 },
}
const stateNames: Record<OrbState, string> = {
  idle: "ready",
  listening: "listening",
  thinking: "thinking",
  speaking: "speaking",
}

function AiOrb({ state = "idle", level = 0, label, size, className, style, ...props }: AiOrbProps) {
  const reduce = useReducedMotion()
  const clamped = Math.min(1, Math.max(0, Number.isFinite(level) ? level : 0))
  const live = state === "listening" || state === "speaking"
  const swell = live ? 1 + clamped * 0.14 : 1
  const name = label === undefined ? `Assistant is ${stateNames[state]}` : label
  const spin = speeds[state]
  const breath = breathing[state]

  return (
    <div
      data-slot="ai-orb"
      data-state={state}
      role={name === null ? undefined : "img"}
      aria-label={name ?? undefined}
      aria-hidden={name === null ? true : undefined}
      className={cn(orbVariants({ size }), className)}
      style={style}
      {...props}
    >
      {/* Soft halo that follows the same swell. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[18%] -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--chart-1)_45%,transparent),transparent)] opacity-70 blur-xl dark:opacity-60"
        animate={{ scale: reduce ? 1 : swell * 1.05 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-full bg-background shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22),inset_0_-8px_18px_-6px_rgb(0_0_0/0.25),0_6px_18px_-8px_rgb(0_0_0/0.35)]"
        animate={reduce ? { scale: 1 } : { scale: breath.scale.map((v) => v * swell) }}
        transition={
          reduce
            ? undefined
            : live && clamped > 0
              ? { type: "spring", stiffness: 220, damping: 16 }
              : { duration: breath.duration, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div
          className="absolute -inset-[30%]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={reduce ? undefined : { duration: spin, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute top-[12%] left-[10%] size-[62%] rounded-full bg-chart-1 opacity-90 blur-[14px]" />
          <span className="absolute right-[6%] bottom-[8%] size-[58%] rounded-full bg-chart-2 opacity-90 blur-[14px]" />
          <span className="absolute top-[38%] left-[34%] size-[48%] rounded-full bg-chart-4 opacity-80 blur-[12px]" />
        </motion.div>
        <motion.div
          className="absolute -inset-[30%]"
          animate={reduce ? undefined : { rotate: -360 }}
          transition={reduce ? undefined : { duration: spin * 1.4, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute top-[6%] right-[18%] size-[40%] rounded-full bg-chart-5 opacity-70 blur-[12px]" />
          <span className="absolute bottom-[14%] left-[16%] size-[36%] rounded-full bg-chart-3 opacity-70 blur-[12px]" />
        </motion.div>
        {/* Glass highlight. */}
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(120%_120%_at_30%_14%,rgb(255_255_255/0.55),transparent_46%)]" />
        <span className="absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,transparent_68%,rgb(255_255_255/0.16))]" />
      </motion.div>
    </div>
  )
}

export { AiOrb, orbVariants, type AiOrbProps, type OrbState }
