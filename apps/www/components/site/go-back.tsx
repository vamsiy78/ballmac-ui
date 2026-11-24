"use client"

import { History } from "lucide-react"
import { useRouter } from "next/navigation"

/** "Go back" for the 404 page: the previous page when there is one in this tab, the home page otherwise. */
export function GoBack({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <button type="button" className={className} onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}>
      <span className="bg-background inline-flex size-8 items-center justify-center rounded-full shadow-[0_1px_2px_rgb(0_0_0/0.08)]">
        <History className="size-4" aria-hidden="true" />
      </span>
      Go back
    </button>
  )
}
