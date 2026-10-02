// Ballmac UI: Lock Screen. https://ui.ballmac.com/components/lock-screen
"use client"

import * as React from "react"
import { ArrowRight, Camera, Flashlight, Lock } from "lucide-react"
import { AnimatePresence, motion, useAnimationControls } from "motion/react"

import { cn } from "@/lib/utils"
import { useReducedMotionSafe } from "@/lib/ballmac/motion"
import { useMessages } from "@/lib/ballmac/i18n"
import { Media, isMediaImage, type MediaSource } from "@/components/ballmac/media"

type LockScreenProps = Omit<React.ComponentProps<"section">, "onSubmit"> & {
  /** "mac" shows a password field under the user's avatar; "ios" shows notifications and a swipe-up unlock. */
  variant?: "mac" | "ios"
  /** Controlled state. While true the lock screen covers its positioned parent. */
  locked?: boolean
  /** Initial state when uncontrolled. */
  defaultLocked?: boolean
  /** Called with the new state when the screen unlocks. */
  onLockedChange?: (locked: boolean) => void
  /** Time to show, such as "9:41". Omit for a live clock. */
  time?: string
  /** Date to show, such as "Thursday, October 1". Omit for the live date. */
  date?: string
  /** Name under the avatar (mac). */
  name?: string
  /** Replaces the default avatar (mac): an image, icon or initials. */
  avatar?: React.ReactNode
  /** The correct password (mac). Without it, any entry unlocks. */
  password?: string
  /** Extra check on the entered password (mac). Return false to reject it. */
  onUnlock?: (password: string) => boolean | void
  /** Hint under the field (mac). */
  hint?: string
  /** Replaces the default wallpaper. An image URL, an object with alt text and a dark-mode file, or an element that fills it; text stays white, so keep it dark enough. */
  wallpaper?: MediaSource
  /** Notifications on iOS, or controls along the bottom on mac. */
  children?: React.ReactNode
}

function useClock(fixedTime?: string, fixedDate?: string) {
  const [now, setNow] = React.useState<Date | null>(null)
  React.useEffect(() => {
    if (fixedTime && fixedDate) return
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const d = new Date()
      setNow(d)
      timer = setTimeout(tick, 60000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50)
    }
    tick()
    return () => clearTimeout(timer)
  }, [fixedTime, fixedDate])
  return { now }
}

function format(now: Date | null, variant: "mac" | "ios") {
  // Until mounted, render a fixed value so server and browser agree.
  if (!now) return { time: "9:41", date: variant === "ios" ? "Thursday, October 1" : "Thu Oct 1" }
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?[AP]M$/i, "")
  const date =
    variant === "ios"
      ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      : now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "")
  return { time, date }
}

function DefaultWallpaper() {
  return (
    <div aria-hidden="true" data-slot="lock-screen-wallpaper" className="absolute inset-0 overflow-hidden bg-[oklch(0.3_0.1_282)]">
      <div className="absolute -top-1/4 -start-1/4 size-[85%] rounded-full bg-[oklch(0.5_0.2_305)] opacity-70 blur-[70px]" />
      <div className="absolute -end-1/4 bottom-[-20%] size-[90%] rounded-full bg-[oklch(0.5_0.17_28)] opacity-70 blur-[80px]" />
      <div className="absolute top-1/3 start-1/3 size-[55%] rounded-full bg-[oklch(0.45_0.15_235)] opacity-60 blur-[70px]" />
    </div>
  )
}

/**
 * A full-screen lock screen in two flavors: macOS (big clock, avatar, password field that shakes when wrong) and
 * iOS (date, huge clock, notification stack, flashlight and camera buttons, swipe up to unlock).
 * It covers its positioned parent and slides or fades away when unlocked. The clock is live and hydration-safe.
 */
function LockScreen({
  variant = "mac",
  locked: lockedProp,
  defaultLocked = true,
  onLockedChange,
  time,
  date,
  name = "Alex Morgan",
  avatar,
  password,
  onUnlock,
  hint,
  wallpaper,
  children,
  className,
  ...props
}: LockScreenProps) {
  const msg = useMessages()
  hint ??= msg("lock-screen.hint", "Touch ID or enter password")
  const reduce = useReducedMotionSafe()
  const uid = React.useId()
  const [lockedState, setLockedState] = React.useState(defaultLocked)
  const locked = lockedProp ?? lockedState
  const { now } = useClock(time, date)
  const shown = format(now, variant)
  const clock = time ?? shown.time
  const day = date ?? shown.date
  const [value, setValue] = React.useState("")
  const [failed, setFailed] = React.useState(false)
  const shake = useAnimationControls()
  const inputRef = React.useRef<HTMLInputElement>(null)

  function unlock() {
    setLockedState(false)
    setValue("")
    setFailed(false)
    onLockedChange?.(false)
  }

  // A lock screen that comes back starts clean.
  React.useEffect(() => {
    if (locked) {
      setValue("")
      setFailed(false)
    }
  }, [locked])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const ok = (password === undefined || value === password) && onUnlock?.(value) !== false
    if (ok) return unlock()
    setFailed(true)
    setValue("")
    inputRef.current?.focus()
    if (!reduce) await shake.start({ x: [0, -12, 11, -9, 7, -4, 2, 0], transition: { duration: 0.45, ease: "easeOut" } })
  }

  const exit = reduce
    ? { opacity: 0 }
    : variant === "ios"
      ? { y: "-100%", transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] as const } }
      : { opacity: 0, scale: 1.08, filter: "blur(12px)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <AnimatePresence>
      {locked && (
        <motion.section
          key="lock"
          data-slot="lock-screen"
          data-variant={variant}
          aria-label={msg("lock-screen.lockScreen", "Lock screen")}
          className={cn("@container absolute inset-0 z-50 flex select-none flex-col overflow-hidden text-white", className)}
          initial={false}
          exit={exit}
          {...(variant === "ios" && !reduce
            ? {
                drag: "y" as const,
                dragConstraints: { top: 0, bottom: 0 },
                dragElastic: { top: 0.6, bottom: 0 },
                onDragEnd: (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
                  if (info.offset.y < -110 || info.velocity.y < -600) unlock()
                },
              }
            : {})}
          {...(props as object)}
        >
          {isMediaImage(wallpaper) ? <Media media={wallpaper} alt="" fill priority className="absolute inset-0" /> : (wallpaper ?? <DefaultWallpaper />)}
          <div aria-hidden="true" className="absolute inset-0 bg-black/20" />

          {variant === "ios" ? (
            <div className="relative flex min-h-0 flex-1 flex-col items-center px-[6cqw] pt-[14cqw] pb-[9cqw]">
              <p className="text-[clamp(0.8rem,4.6cqw,1.35rem)] font-medium text-white/90 [text-shadow:0_1px_8px_rgb(0_0_0/0.3)]">{day}</p>
              <p className="-mt-[1cqw] bg-gradient-to-b from-white to-white/70 bg-clip-text text-[clamp(4rem,23cqw,9rem)] leading-[1.05] font-semibold tracking-tight tabular-nums text-transparent">
                {clock}
              </p>
              <div className="mt-[6cqw] flex min-h-0 w-full max-w-[34rem] flex-1 flex-col gap-[2cqw] overflow-hidden">{children}</div>
              <div className="mt-[3cqw] flex w-full max-w-[34rem] items-center justify-between px-[2cqw]">
                {[
                  [Flashlight, "Flashlight"],
                  [Camera, "Camera"],
                ].map(([Glyph, label]) => {
                  const Icon = Glyph as typeof Flashlight
                  return (
                    <button
                      key={label as string}
                      type="button"
                      aria-label={label as string}
                      className="flex size-[clamp(2.75rem,12.5cqw,4rem)] items-center justify-center rounded-full bg-black/35 text-white outline-none backdrop-blur-xl transition-colors hover:bg-black/45 focus-visible:ring-[3px] focus-visible:ring-white/70 [&_svg]:size-[45%]"
                    >
                      <Icon aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={unlock}
                className="mt-[3cqw] rounded-full px-4 py-2 text-[clamp(0.75rem,3.4cqw,0.95rem)] font-medium text-white/85 outline-none focus-visible:ring-[3px] focus-visible:ring-white/70"
              >
                <span aria-hidden="true" className="mx-auto mb-2 block h-1 w-28 rounded-full bg-white/85" />
                {reduce ? "Unlock" : "Swipe up to unlock"}
              </button>
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col items-center px-6 pt-[clamp(2rem,6vw,4rem)] pb-6">
              <p className="text-[clamp(1rem,2.4cqw,1.5rem)] font-medium text-white/90 [text-shadow:0_1px_8px_rgb(0_0_0/0.3)]">{day}</p>
              <p className="bg-gradient-to-b from-white to-white/75 bg-clip-text text-[clamp(4.5rem,13cqw,9rem)] leading-none font-bold tracking-tight tabular-nums text-transparent">
                {clock}
              </p>
              <div className="mt-auto flex w-full flex-col items-center">
                <div className="flex size-[4.75rem] items-center justify-center overflow-hidden rounded-full bg-white/20 text-3xl font-semibold shadow-[0_2px_12px_rgb(0_0_0/0.35)] ring-1 ring-white/30 backdrop-blur-xl [&>img]:size-full [&>img]:object-cover [&>svg]:size-[55%]">
                  {avatar ?? <span aria-hidden="true">{name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}</span>}
                </div>
                <p className="mt-3 text-lg font-semibold [text-shadow:0_1px_6px_rgb(0_0_0/0.35)]">{name}</p>
                <motion.form animate={shake} onSubmit={submit} className="relative mt-3 w-full max-w-[15rem]" noValidate>
                  <label htmlFor={`${uid}-pw`} className="sr-only">
                    {msg("lock-screen.passwordFor", "Password for {name}", { name })}
                  </label>
                  <input
                    ref={inputRef}
                    id={`${uid}-pw`}
                    type="password"
                    autoComplete="current-password"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={msg("lock-screen.enterPassword", "Enter Password")}
                    aria-invalid={failed || undefined}
                    aria-describedby={`${uid}-hint`}
                    className="h-9 w-full rounded-full border border-white/25 bg-white/20 pe-10 ps-4 text-[15px] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] outline-none backdrop-blur-xl placeholder:text-white/80 focus-visible:border-white/60 focus-visible:ring-[3px] focus-visible:ring-white/40"
                  />
                  <button
                    type="submit"
                    aria-label={msg("lock-screen.unlock", "Unlock")}
                    className="absolute top-1/2 end-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white outline-none transition-colors hover:bg-white/45 focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ArrowRight aria-hidden="true" className="size-3.5 rtl:rotate-180" strokeWidth={2.75} />
                  </button>
                </motion.form>
                <p id={`${uid}-hint`} role={failed ? "alert" : undefined} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white/85 [text-shadow:0_1px_4px_rgb(0_0_0/0.4)]">
                  {failed ? (
                    "Incorrect password. Try again."
                  ) : (
                    <>
                      <Lock aria-hidden="true" className="size-3" />
                      {hint}
                    </>
                  )}
                </p>
                {children && <div className="mt-6 flex items-center justify-center gap-6">{children}</div>}
              </div>
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export { LockScreen, type LockScreenProps }
