"use client"

import NextLink from "next/link"
import * as React from "react"

/**
 * next/link that only prefetches once someone shows intent (pointer, keyboard focus or touch).
 * The default prefetches every link that scrolls into view, and a prefetched page also preloads its client code:
 * on this site that put the home page's scripts, and the docs sidebar's hundreds of pages, on every page load.
 */
export default function Link({ prefetch, onPointerEnter, onFocus, onTouchStart, ...props }: React.ComponentProps<typeof NextLink>) {
  const [intent, setIntent] = React.useState(false)
  return (
    <NextLink
      {...props}
      prefetch={prefetch ?? (intent ? null : false)}
      onPointerEnter={(e) => (setIntent(true), onPointerEnter?.(e))}
      onFocus={(e) => (setIntent(true), onFocus?.(e))}
      onTouchStart={(e) => (setIntent(true), onTouchStart?.(e))}
    />
  )
}
