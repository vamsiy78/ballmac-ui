"use client"
import * as React from "react"
import { SearchField } from "@/components/ballmac/search-field"
const items = [
  "Design system",
  "Motion presets",
  "Content library",
  "Project settings",
]
export default function SearchFieldDemo() {
  const [query, setQuery] = React.useState("motion")
  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-4 shadow-sm">
      <SearchField
        value={query}
        onValueChange={setQuery}
        label="Search workspace"
        placeholder="Search workspace"
      />
      <div className="mt-3 flex flex-col gap-1">
        {items
          .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
          .map((item) => (
            <div
              key={item}
              className="rounded-md px-2 py-2 text-sm hover:bg-accent"
            >
              {item}
            </div>
          ))}
        {!items.some((item) =>
          item.toLowerCase().includes(query.toLowerCase()),
        ) && (
          <p className="px-2 py-2 text-sm text-muted-foreground">
            No matches yet
          </p>
        )}
      </div>
    </div>
  )
}
