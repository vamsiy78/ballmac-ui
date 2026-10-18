// Ballmac UI: Return focus. https://ui.ballmac.com/components/dialog
// Puts keyboard focus back where it was when a dialog opened.
import * as React from "react"

/**
 * Radix returns focus to a dialog's trigger when it closes, so a dialog opened from state (a confirmation after pressing Delete, a
 * lightbox opened from a tile) has no trigger and focus falls back to the top of the page. This remembers the element that had focus
 * when `open` became true and returns it there. Spread the result onto DialogContent or AlertDialogContent.
 */
export function useReturnFocus(open: boolean) {
  const from = React.useRef<HTMLElement | null>(null)
  // layout effects run before the dialog moves focus into itself, so this still sees the element that opened it
  React.useLayoutEffect(() => {
    if (open) from.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }, [open])
  return {
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault()
      from.current?.focus()
    },
  }
}
