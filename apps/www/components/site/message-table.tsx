"use client"

import * as React from "react"

/** Every built-in string with its key, filterable. Keys group by component (the part before the first dot). */
export function MessageTable({ messages }: { messages: Record<string, string> }) {
  const [query, setQuery] = React.useState("")
  const id = React.useId()
  const q = query.trim().toLowerCase()
  const rows = React.useMemo(() => Object.entries(messages).filter(([k, v]) => !q || k.toLowerCase().includes(q) || v.toLowerCase().includes(q)), [messages, q])
  return (
    <div className="not-prose space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id} className="sr-only">
          Filter messages
        </label>
        <input
          id={id}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by key or text"
          className="focus-visible:ring-ring/50 h-9 w-full max-w-xs rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
        />
        <p className="text-muted-foreground text-sm" role="status">
          {rows.length} of {Object.keys(messages).length} messages
        </p>
      </div>
      <div className="max-h-[560px] overflow-auto rounded-xl border" tabIndex={0} role="region" aria-label="Message keys">
        <table className="w-full text-start text-sm">
          <thead className="bg-muted/60 sticky top-0 text-xs">
            <tr>
              <th scope="col" className="px-3 py-2 text-start font-medium">
                Key
              </th>
              <th scope="col" className="px-3 py-2 text-start font-medium">
                English
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(([key, text]) => (
              <tr key={key}>
                <td className="px-3 py-1.5 font-mono text-xs whitespace-nowrap">{key}</td>
                <td className="text-muted-foreground px-3 py-1.5">{text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
