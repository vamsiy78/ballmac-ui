// Ballmac UI: Match Highlight. https://ui.ballmac.com/components/match-highlight
import * as React from "react"

import { cn } from "@/lib/utils"

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** The words of a search, lowercased, without blanks or repeats. */
function queryTokens(query: string | string[]): string[] {
  const words = Array.isArray(query) ? query : query.split(/\s+/)
  return [...new Set(words.map((w) => w.trim().toLowerCase()).filter(Boolean))]
}

/** Whether every word of the search occurs in the text, ignoring case. An empty search matches everything. */
function matchesAll(text: string, query: string | string[]) {
  const lower = text.toLowerCase()
  return queryTokens(query).every((t) => lower.includes(t))
}

/** How many times any word of the search occurs in the text, ignoring case. */
function countMatches(text: string, query: string | string[]) {
  const tokens = queryTokens(query)
  if (!tokens.length) return 0
  return (text.match(new RegExp(tokens.map(escapeRegExp).join("|"), "gi")) ?? []).length
}

type MatchHighlightProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The text to show. */
  text: string
  /** What was searched for: a string (split into words) or a list of words. Every occurrence of any word is marked. */
  query?: string | string[]
}

/**
 * Text with the words of a search marked, as search results show them. It uses the real <mark> element, so screen readers can
 * find the matches, and a tint of a theme color that keeps the text readable in light and dark. Runs on the server.
 */
function MatchHighlight({ text, query = "", className, ...props }: MatchHighlightProps) {
  const tokens = queryTokens(query)
  if (!tokens.length) return <span data-slot="match-highlight" className={className} {...props}>{text}</span>
  const parts = text.split(new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi"))
  return (
    <span data-slot="match-highlight" className={className} {...props}>
      {parts.map((part, i) =>
        i % 2 ? (
          <mark key={i} className={cn("bg-chart-3/35 text-foreground rounded-sm")}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}

export { MatchHighlight, queryTokens, matchesAll, countMatches, type MatchHighlightProps }
