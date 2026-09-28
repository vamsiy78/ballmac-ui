"use client"

import * as React from "react"

export const PMS = ["pnpm", "npm", "yarn", "bun"] as const
export type PM = (typeof PMS)[number]
const KEY = "bm-package-manager"
const listeners = new Set<() => void>()

function read(): PM {
  try {
    const v = localStorage.getItem(KEY)
    return (PMS as readonly string[]).includes(v ?? "") ? (v as PM) : "pnpm"
  } catch {
    return "pnpm"
  }
}

/** The visitor's package manager, shared by every install tab on the site and remembered. */
export function usePackageManager(): [PM, (pm: PM) => void] {
  const pm = React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => "pnpm" as PM
  )
  const set = React.useCallback((next: PM) => {
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Storage unavailable: still switch for this page view.
    }
    listeners.forEach((l) => l())
  }, [])
  return [pm, set]
}
