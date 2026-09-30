// Ballmac UI: Scroll utilities. https://ui.ballmac.com/components/scroll
"use client"

import * as React from "react"

/** An element to scroll, or `null`/`undefined` for the window. */
export type ScrollContainer = React.RefObject<HTMLElement | null> | null | undefined

function readY(container: ScrollContainer) {
  const el = container?.current
  return el ? el.scrollTop : typeof window === "undefined" ? 0 : window.scrollY
}

function scrollTarget(container: ScrollContainer): HTMLElement | Window {
  return container?.current ?? window
}

/** True when the user asked the OS for less motion. Safe to call in event handlers. */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Smoothly scrolls an element into view below a sticky header. Jumps instantly under reduced motion.
 * `offset` is the pixel space to leave above the element; `container` is the scrolling element (default: the page).
 */
export function scrollToElement(element: Element, options: { offset?: number; container?: ScrollContainer } = {}) {
  const { offset = 0, container } = options
  const box = container?.current
  const behavior = prefersReducedMotion() ? "auto" : "smooth"
  if (box) {
    const top = element.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - offset
    box.scrollTo({ top, behavior })
  } else {
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - offset, behavior })
  }
}

/** Scrolls to the element with this id. Returns false when it does not exist. */
export function scrollToId(id: string, options: { offset?: number; container?: ScrollContainer } = {}) {
  const el = (options.container?.current ?? document).querySelector?.(`[id="${CSS.escape(id)}"]`) ?? document.getElementById(id)
  if (!el) return false
  scrollToElement(el, options)
  return true
}

function useScrollListener(container: ScrollContainer, onScroll: (y: number) => void) {
  const handler = React.useRef(onScroll)
  React.useEffect(() => {
    handler.current = onScroll
  })
  React.useEffect(() => {
    const target = scrollTarget(container)
    let frame = 0
    const run = () => {
      frame = 0
      handler.current(readY(container))
    }
    const onEvent = () => {
      if (!frame) frame = requestAnimationFrame(run)
    }
    target.addEventListener("scroll", onEvent, { passive: true })
    window.addEventListener("resize", onEvent, { passive: true })
    frame = requestAnimationFrame(run)
    return () => {
      target.removeEventListener("scroll", onEvent)
      window.removeEventListener("resize", onEvent)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [container])
}

/** True once the page (or `container`) has scrolled past `threshold` pixels. False on the server and first render. */
export function useScrolled(threshold = 8, container?: ScrollContainer) {
  const [scrolled, setScrolled] = React.useState(false)
  useScrollListener(container, (y) => setScrolled(y > threshold))
  return scrolled
}

/** "down" or "up" from the last meaningful scroll movement. Small jitters under `threshold` pixels are ignored. */
export function useScrollDirection(threshold = 10, container?: ScrollContainer) {
  const [direction, setDirection] = React.useState<"up" | "down">("up")
  const last = React.useRef(0)
  useScrollListener(container, (y) => {
    const delta = y - last.current
    if (Math.abs(delta) < threshold) return
    last.current = y
    setDirection(delta > 0 ? "down" : "up")
  })
  return direction
}

/**
 * Returns the id of the section the reader is in: the last id whose element top has passed `offset` pixels from the
 * top of the viewport (or container). At the very end of the page the last id wins, so short final sections can be reached.
 */
export function useScrollSpy(ids: string[], options: { offset?: number; container?: ScrollContainer } = {}) {
  const { offset = 96, container } = options
  const [active, setActive] = React.useState<string | undefined>(ids[0])
  const key = ids.join("\u0000")
  const list = React.useMemo(() => (key ? key.split("\u0000") : []), [key])
  useScrollListener(container, () => {
    if (!list.length) return
    const box = container?.current
    const boxTop = box ? box.getBoundingClientRect().top : 0
    let current = list[0]
    for (const id of list) {
      const el = document.getElementById(id)
      if (!el) continue
      if (el.getBoundingClientRect().top - boxTop - offset <= 1) current = id
      else break
    }
    const atEnd = box
      ? box.scrollTop + box.clientHeight >= box.scrollHeight - 2
      : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
    if (atEnd && list.length > 1 && (box ? box.scrollTop > 0 : window.scrollY > 0)) current = list[list.length - 1]
    setActive(current)
  })
  return active
}
