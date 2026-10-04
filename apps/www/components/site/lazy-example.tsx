"use client"

import * as React from "react"

// The example code map is imported on first render, not with the page. A gallery page lists this component by name for every tile,
// so the page itself never references (or preloads the scripts of) the examples.
const Loaded = React.lazy(async () => {
  const { ExampleRenderer } = await import("@/lib/generated/examples-client")
  return { default: ExampleRenderer }
})

/** A free example, fetched when it is first rendered. */
export function LazyExample({ name }: { name: string }) {
  return (
    <React.Suspense fallback={null}>
      <Loaded name={name} />
    </React.Suspense>
  )
}
