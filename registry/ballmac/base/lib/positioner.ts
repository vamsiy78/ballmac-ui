// Ballmac UI: Radix-shaped props for Base UI popups. https://ui.ballmac.com/docs/guides/base-ui
import type * as React from "react"

/** The props of a Base UI popup that belong to its positioner (where it sits) and not to the popup itself (how it looks). */
const POSITIONER_KEYS = ["side", "align", "sideOffset", "alignOffset", "collisionPadding", "collisionBoundary", "collisionAvoidance", "sticky", "arrowPadding", "anchor", "positionMethod", "disableAnchorTracking"] as const

type PositionerKey = (typeof POSITIONER_KEYS)[number]

/**
 * Radix UI puts `side`, `align` and `sideOffset` on the popup's content; Base UI puts them on a separate positioner element. This splits the props of one
 * Ballmac content component into the two, so `<PopoverContent side="top" sideOffset={8} className="w-80">` keeps working.
 */
export function splitPositioner<T extends object>(props: T): [Pick<T, Extract<keyof T, PositionerKey>>, Omit<T, PositionerKey>] {
  const positioner: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) (POSITIONER_KEYS as readonly string[]).includes(key) ? (positioner[key] = value) : (rest[key] = value)
  return [positioner as never, rest as never]
}

/**
 * Radix UI menu items take `onSelect(event)`; Base UI menu items take `onClick`. Both run when the item is chosen with the pointer or the keyboard.
 * Pass what the caller gave for both, and the item calls whichever was set (and both, onClick first).
 */
export function selectHandler<E extends { nativeEvent?: Event }>(onSelect?: (event: Event) => void, onClick?: (event: E) => void) {
  return onSelect || onClick
    ? (event: E) => {
        onClick?.(event)
        onSelect?.(event.nativeEvent ?? (event as unknown as Event))
      }
    : undefined
}

/**
 * Radix UI's close buttons stay open when the click handler calls `event.preventDefault()`, which is how a confirm button waits for a request to
 * finish. Base UI uses `event.preventBaseUIHandler()` for the same. This makes the first mean the second.
 */
export function keepOpenWhenPrevented<E extends { defaultPrevented: boolean }>(onClick?: (event: E) => void) {
  return (event: E) => {
    onClick?.(event)
    if (event.defaultPrevented) (event as unknown as { preventBaseUIHandler?: () => void }).preventBaseUIHandler?.()
  }
}

/**
 * Radix UI's content takes `onOpenAutoFocus` and `onCloseAutoFocus`, and `event.preventDefault()` in them stops the default focus move so the caller can
 * place focus itself. Base UI takes `initialFocus` and `finalFocus` on the popup. This turns the first into the second.
 */
export function autoFocus(onOpenAutoFocus?: (event: Event) => void, onCloseAutoFocus?: (event: Event) => void) {
  const ask = (handler: (event: Event) => void) => () => {
    const event = new Event("focus", { cancelable: true })
    handler(event)
    return !event.defaultPrevented
  }
  return {
    ...(onOpenAutoFocus ? { initialFocus: ask(onOpenAutoFocus) } : {}),
    ...(onCloseAutoFocus ? { finalFocus: ask(onCloseAutoFocus) } : {}),
  }
}

export type AutoFocusProps = {
  /** Called as the content opens. Call `event.preventDefault()` to place focus yourself. */
  onOpenAutoFocus?: (event: Event) => void
  /** Called as the content closes. Call `event.preventDefault()` to place focus yourself instead of returning it to the trigger. */
  onCloseAutoFocus?: (event: Event) => void
}

export type { React }
