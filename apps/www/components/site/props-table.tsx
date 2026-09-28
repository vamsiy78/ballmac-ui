import type { SiteItem } from "@/lib/registry"

/** Props generated from each component's TypeScript types at build time. */
export function PropsTable({ docs }: { docs: SiteItem["props"] }) {
  return (
    <div className="space-y-6">
      {docs.map((d) => (
        <div key={d.component} className="space-y-2">
          {docs.length > 1 && <h3 className="font-mono text-sm font-medium">{`<${d.component}>`}</h3>}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-card text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Prop</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Default</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {d.props.map((p) => (
                  <tr key={p.name} className="align-top">
                    <td className="px-4 py-3">
                      <code className="font-mono text-[13px]">
                        {p.name}
                        {p.required && <span className="text-destructive" aria-label="required">*</span>}
                      </code>
                      {p.description && <p className="text-muted-foreground mt-1 max-w-xs text-[13px] leading-snug">{p.description}</p>}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-[12px] break-words">{p.type}</td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-[12px]">{p.default ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="text-muted-foreground text-[13px]">Also accepts the standard attributes of its root element.</p>
    </div>
  )
}
