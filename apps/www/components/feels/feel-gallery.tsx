"use client"

import * as React from "react"
import { DEFAULT_SPEC } from "@ballmac-ui/theme-engine"

import { FeelCompare } from "@/components/themes/feel-compare"

const subscribeNever = () => () => {}

/** All four feels at once, in the site's own colour mode. */
export function FeelGallery() {
  const dark = React.useSyncExternalStore(subscribeNever, () => document.documentElement.classList.contains("dark"), () => false)
  return <FeelCompare spec={DEFAULT_SPEC} mode={dark ? "dark" : "light"} reduced={false} id="gallery" />
}
