import * as React from "react"

import { SortableGroup, SortableGroups, SortableHandle, SortableItem, type SortableGroupsValue } from "@/components/ballmac/sortable"

const titles: Record<string, string> = {
  "fix-login": "Fix the sign-in redirect",
  "invoice-pdf": "Invoice PDF layout",
  "docs-rtl": "Document mirrored layouts",
  "empty-states": "Draw empty states",
  "rate-limit": "Rate limit the public API",
  "release-notes": "Write release notes",
  "csv-export": "CSV export for reports",
}

const columns = { todo: "To do", doing: "In progress", done: "Done" } as const

export default function SortableBoard() {
  const [groups, setGroups] = React.useState<SortableGroupsValue>({
    todo: ["fix-login", "invoice-pdf", "docs-rtl"],
    doing: ["empty-states", "rate-limit"],
    done: ["release-notes", "csv-export"],
  })
  return (
    <SortableGroups label="Sprint board" value={groups} onValueChange={setGroups} getLabel={(id) => titles[id] ?? id} getGroupLabel={(g) => columns[g as keyof typeof columns]} className="w-full max-w-3xl">
      {Object.keys(groups).map((g) => (
        <div key={g} className="min-w-0 flex-1 space-y-2">
          <h3 className="flex items-center justify-between px-1 text-sm font-medium">
            {columns[g as keyof typeof columns]}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{groups[g]!.length}</span>
          </h3>
          <SortableGroup id={g}>
            {groups[g]!.map((id) => (
              <SortableItem key={id} id={id} className="items-start gap-2 p-2.5">
                <SortableHandle className="-ms-1 size-7" />
                <span className="min-w-0 flex-1 pt-1 leading-snug">{titles[id]}</span>
              </SortableItem>
            ))}
          </SortableGroup>
        </div>
      ))}
    </SortableGroups>
  )
}
