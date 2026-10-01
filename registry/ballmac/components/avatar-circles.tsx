// Ballmac UI: Avatar Circles. https://ui.ballmac.com/components/avatar-circles
"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type AvatarPerson = {
  /** Full name. Used for the tooltip and the accessible name. */
  name: string
  /** Picture URL. Initials are shown when missing or when it fails to load. */
  src?: string
  /** Second line in the tooltip, such as a role. */
  role?: string
  /** Presence dot, shown with a word for assistive tech. */
  status?: "online" | "busy" | "away"
  /** Makes the avatar a link. */
  href?: string
}

const TONES = [
  "bg-[color-mix(in_oklab,var(--chart-1)_62%,var(--background))]",
  "bg-[color-mix(in_oklab,var(--chart-2)_62%,var(--background))]",
  "bg-[color-mix(in_oklab,var(--chart-3)_62%,var(--background))]",
  "bg-[color-mix(in_oklab,var(--chart-4)_62%,var(--background))]",
  "bg-[color-mix(in_oklab,var(--chart-5)_62%,var(--background))]",
]
const SIZES = {
  sm: { box: "size-8 text-[11px]", overlap: "-ml-2.5", spread: "group-hover/circles:-ml-1 group-focus-within/circles:-ml-1", dot: "size-2" },
  default: { box: "size-10 text-xs", overlap: "-ml-3", spread: "group-hover/circles:-ml-1.5 group-focus-within/circles:-ml-1.5", dot: "size-2.5" },
  lg: { box: "size-14 text-sm", overlap: "-ml-4", spread: "group-hover/circles:-ml-2 group-focus-within/circles:-ml-2", dot: "size-3" },
}
const STATUS_DOT = { online: "bg-chart-2", busy: "bg-destructive", away: "bg-chart-3" }
const STATUS_WORD = { online: "online", busy: "busy", away: "away" }

function hue(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h % TONES.length
}

function initials(name: string) {
  const words = name.trim().split(/\s+/)
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "")).toUpperCase()
}

function Face({ person, size }: { person: AvatarPerson; size: keyof typeof SIZES }) {
  const [failed, setFailed] = React.useState(false)
  const s = SIZES[size]
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-background font-semibold text-foreground",
        s.box,
        (!person.src || failed) && TONES[hue(person.name)]
      )}
    >
      {person.src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.src} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        initials(person.name)
      )}
    </span>
  )
}

type AvatarCirclesProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The people to show, first on the left. */
  people: AvatarPerson[]
  /** How many faces show before the "+N" circle. */
  max?: number
  /** Total number of people, when more than `people.length` (for example 1,200 members but 8 loaded). */
  total?: number
  /** Face size. */
  size?: keyof typeof SIZES
  /** Makes the "+N" circle a button. */
  onOverflowClick?: () => void
  /** Accessible name of the whole group. */
  label?: string
}

function AvatarCircles({ people, max = 5, total, size = "default", onOverflowClick, label, className, ...props }: AvatarCirclesProps) {
  const reduce = useReducedMotion()
  const shown = people.slice(0, max)
  const extra = Math.max((total ?? people.length) - shown.length, 0)
  const s = SIZES[size]
  const summary = label ?? `${total ?? people.length} ${(total ?? people.length) === 1 ? "person" : "people"}`

  return (
    <div data-slot="avatar-circles" role="group" aria-label={summary} className={cn("group/circles flex items-center", className)} {...props}>
      {shown.map((person, i) => {
        const name = person.status ? `${person.name}, ${STATUS_WORD[person.status]}` : person.name
        const inner = (
          <>
            <Face person={person} size={size} />
            {person.status && (
              <span aria-hidden="true" className={cn("absolute right-0 bottom-0 z-10 rounded-full ring-2 ring-background", s.dot, STATUS_DOT[person.status])} />
            )}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 rounded-lg border bg-popover px-2.5 py-1.5 text-center text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover/face:opacity-100 group-focus-visible/face:opacity-100 motion-reduce:transition-none"
            >
              <span className="block font-medium">{person.name}</span>
              {person.role && <span className="block text-muted-foreground">{person.role}</span>}
            </span>
          </>
        )
        const common = cn(
          "group/face relative inline-flex rounded-full outline-none transition-[margin] duration-200 focus-visible:z-20 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
          i > 0 && s.overlap,
          i > 0 && s.spread
        )
        return (
          <motion.span
            key={`${person.name}-${i}`}
            className="relative inline-flex"
            style={{ zIndex: shown.length - i }}
            whileHover={reduce ? undefined : { y: -4, scale: 1.1, zIndex: 40 }}
            whileFocus={reduce ? undefined : { y: -4, scale: 1.1, zIndex: 40 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            {person.href ? (
              <a href={person.href} aria-label={name} className={common}>
                {inner}
              </a>
            ) : (
              <button type="button" aria-label={name} className={common}>
                {inner}
              </button>
            )}
          </motion.span>
        )
      })}
      {extra > 0 &&
        (onOverflowClick ? (
          <button
            type="button"
            onClick={onOverflowClick}
            aria-label={`and ${extra} more`}
            className={cn("relative z-0 flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-foreground ring-2 ring-background outline-none transition-[margin,background-color] duration-200 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50", s.box, s.overlap, s.spread)}
          >
            +{extra}
          </button>
        ) : (
          <span
            role="img"
            aria-label={`and ${extra} more`}
            className={cn("relative z-0 flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-foreground ring-2 ring-background transition-[margin] duration-200", s.box, s.overlap, s.spread)}
          >
            +{extra}
          </span>
        ))}
    </div>
  )
}

export { AvatarCircles, type AvatarCirclesProps, type AvatarPerson }
