"use client"

import * as React from "react"

import { DirectionProvider } from "@/lib/ballmac/direction"

const subscribe = () => () => {}

/** `/preview/<name>?dir=rtl` renders the preview right-to-left, for the toolbar toggle, tests and shared links. */
export function PreviewDirection({ children }: { children: React.ReactNode }) {
  const search = React.useSyncExternalStore(subscribe, () => window.location.search, () => "")
  const dir = new URLSearchParams(search).get("dir") === "rtl" ? "rtl" : "ltr"
  React.useEffect(() => {
    document.documentElement.dir = dir
    return () => {
      document.documentElement.dir = "ltr"
    }
  }, [dir])
  return <DirectionProvider dir={dir}>{children}</DirectionProvider>
}
