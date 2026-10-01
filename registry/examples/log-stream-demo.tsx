"use client"

import * as React from "react"

import { LogStream, type LogLine } from "@/components/ballmac/log-stream"

const script: Omit<LogLine, "id" | "time">[] = [
  { level: "info", source: "build", message: "Cloning repository acme/storefront (branch main)" },
  { level: "info", source: "build", message: "Installing dependencies with pnpm 10.4" },
  { level: "debug", source: "build", message: "Restored 1,284 packages from cache in 1.2s" },
  { level: "info", source: "build", message: "Running next build" },
  { level: "warn", source: "build", message: "Image /hero.png is 2.1 MB; consider compressing it" },
  { level: "info", source: "build", message: "Compiled successfully in 14.8s" },
  { level: "error", source: "deploy", message: "Health check failed on /api/health: 503 Service Unavailable" },
  { level: "info", source: "deploy", message: "Retrying health check (2 of 5)" },
  { level: "info", source: "deploy", message: "Health check passed in 412 ms" },
  { level: "info", source: "deploy", message: "Promoted deployment dpl_4f9a to production" },
]

export default function LogStreamDemo() {
  const [lines, setLines] = React.useState<LogLine[]>([])
  React.useEffect(() => {
    let i = 0
    const base = Date.UTC(2026, 8, 30, 14, 2, 11)
    const id = setInterval(() => {
      const next = script[i % script.length]!
      const n = i
      setLines((all) => [...all, { ...next, id: n, time: base + n * 730 }].slice(-300))
      i++
    }, 650)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="w-full max-w-2xl">
      <LogStream title="Deployment logs" lines={lines} height="18rem" onClear={() => setLines([])} />
    </div>
  )
}
