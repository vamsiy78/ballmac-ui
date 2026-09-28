"use client"

import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => {
        const dark = document.documentElement.classList.toggle("dark")
        try {
          localStorage.setItem("bm-theme", dark ? "dark" : "light")
        } catch {
          // Storage unavailable: the choice lasts for this page view.
        }
      }}
      className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors"
      aria-label="Toggle dark mode"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  )
}
