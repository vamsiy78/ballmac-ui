import { expect } from "vitest"

/**
 * A disabled control, in either variant: Radix UI renders a native button, Base UI a span (switch, checkbox, radio) that carries
 * `aria-disabled` and `data-disabled` instead.
 */
export function expectDisabled(el: HTMLElement) {
  const native = el.matches(":disabled")
  expect(native || el.getAttribute("aria-disabled") === "true" || el.hasAttribute("data-disabled")).toBe(true)
}
