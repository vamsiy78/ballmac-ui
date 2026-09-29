"use client"

import * as React from "react"

/**
 * `/components?category=backgrounds` (the home page links here) scrolls to that category's section.
 * Runs after load, so the router's own scroll restoration doesn't put the page back at the top.
 */
export function CatalogDeepLink() {
  React.useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category")
    if (!category) return
    const go = () =>
      window.setTimeout(() => {
        const section = document.querySelector<HTMLElement>(`[data-category="${CSS.escape(category)}"]`)
        if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 80 })
      }, 120)
    if (document.readyState === "complete") {
      const id = go()
      return () => window.clearTimeout(id)
    }
    window.addEventListener("load", go, { once: true })
    return () => window.removeEventListener("load", go)
  }, [])
  return null
}
