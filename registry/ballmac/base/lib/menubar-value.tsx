// Ballmac UI: Menubar value (Base UI). https://ui.ballmac.com/docs/guides/base-ui
"use client"

import * as React from "react"

type Value = { value: string; set: (value: string) => void }
const ValueContext = React.createContext<Value | null>(null)

type MenubarValueProps = {
  /** The open menu, by its `value` (an empty string for none). Controls the bar. */
  value?: string
  /** The menu that starts open. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

/**
 * Radix UI's menubar names each menu with a `value` and can be told which one is open. Base UI's menubar manages that itself, so this keeps the same
 * props by opening and closing the menus that have a `value`. Without any of the three props it does nothing and Base UI runs the bar.
 */
export function MenubarValue({ value, defaultValue, onValueChange, children }: MenubarValueProps) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const active = value !== undefined || defaultValue !== undefined || onValueChange !== undefined
  const current = value ?? inner
  const ctx = React.useMemo<Value | null>(
    () =>
      active
        ? {
            value: current,
            set: (next) => {
              setInner(next)
              onValueChange?.(next)
            },
          }
        : null,
    [active, current, onValueChange]
  )
  return <ValueContext.Provider value={ctx}>{children}</ValueContext.Provider>
}

/** The `open` and `onOpenChange` to give a menu that has a `value`, or nothing when the bar is not tracking one. */
export function useMenuValue(menuValue?: string): { open?: boolean; onOpenChange?: (open: boolean) => void } {
  const ctx = React.useContext(ValueContext)
  if (!ctx || menuValue === undefined) return {}
  return { open: ctx.value === menuValue, onOpenChange: (open) => ctx.set(open ? menuValue : ctx.value === menuValue ? "" : ctx.value) }
}
