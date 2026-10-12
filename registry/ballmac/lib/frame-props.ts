// Ballmac UI: Frame Props. https://ui.ballmac.com/docs/states
import type * as React from "react"

const FRAME_ATTRS = new Set(["id", "style", "lang", "dir", "role", "hidden", "title", "tabIndex"])

/**
 * The props a block should put on its own frame while it shows a state instead of its content: plain HTML attributes only.
 * Without this a block's own props (`messages`, `onSend`, `getSeries`) would be spread onto a DOM element.
 */
export function frameProps(props: object): React.HTMLAttributes<HTMLElement> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) if (FRAME_ATTRS.has(k) || k.startsWith("aria-") || k.startsWith("data-")) out[k] = v
  return out
}
