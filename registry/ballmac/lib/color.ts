// Ballmac UI: Color. https://ui.ballmac.com/docs/theming

/**
 * Resolves a theme color for canvas and WebGL effects, which can't use Tailwind classes.
 * Accepts a CSS variable name ("--primary"), a var() expression or any CSS color, read in
 * the context of `element` so light and dark themes both apply. Browser only.
 */
function resolveCssColor(element: Element, color: string): string {
  const style = getComputedStyle(element)
  const name = color.startsWith("--") ? color : /^var\((--[^,)]+)/.exec(color)?.[1]
  const value = name ? style.getPropertyValue(name).trim() : color
  return value || style.color
}

let probe: CanvasRenderingContext2D | null = null

/** The same color as [r, g, b, a] in 0–1, for libraries such as WebGL that need numbers. */
function cssColorToRgba(element: Element, color: string): [number, number, number, number] {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!probe) return [0, 0, 0, 1]
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = resolveCssColor(element, color)
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255, a / 255]
}

/** Calls `onChange` when the theme switches (the `dark` class or a data-theme attribute on <html>). */
function observeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] })
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  media.addEventListener("change", onChange)
  return () => {
    observer.disconnect()
    media.removeEventListener("change", onChange)
  }
}

export { resolveCssColor, cssColorToRgba, observeTheme }
