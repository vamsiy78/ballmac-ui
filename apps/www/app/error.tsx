"use client"

import Link from "@/components/site/link"
import { useEffect } from "react"

import { Button } from "@/components/ballmac/button"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-muted-foreground font-mono text-xs tracking-wide uppercase">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance">This page did not load</h1>
      <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">It is probably a hiccup on our side. Try again, and if it keeps happening, tell us on GitHub.</p>
      {error.digest ? <p className="text-muted-foreground mt-3 font-mono text-xs">Reference: {error.digest}</p> : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button shape="pill" size="lg" onClick={reset}>Try again</Button>
        <Button asChild shape="pill" size="lg" variant="outline">
          <Link href="/">Home page</Link>
        </Button>
      </div>
    </main>
  )
}
