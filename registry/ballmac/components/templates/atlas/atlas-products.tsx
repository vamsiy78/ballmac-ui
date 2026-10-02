// Ballmac UI: Atlas products page. https://ui.ballmac.com/templates/template-atlas
"use client"

import * as React from "react"
import { LayoutGrid, List, Minus, Plus, Search } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ballmac/sheet"
import { moneyExact, products as seed, type AtlasProduct } from "@/components/ballmac/templates/atlas/atlas-data"
import { AtlasPageHeader, AtlasShell, ProductTile, atlasButton, type AtlasHrefs } from "@/components/ballmac/templates/atlas/atlas-theme"
import { cn } from "@/lib/utils"

type View = "grid" | "list"

function Stock({ p }: { p: AtlasProduct }) {
  if (p.stock === 0) return <Badge status="error" variant="outline">Out of stock</Badge>
  if (p.stock <= 10) return <Badge status="warning" variant="outline">{p.stock} left</Badge>
  return <span className="text-muted-foreground text-sm tabular-nums">{p.stock} in stock</span>
}

const categories = ["Paper", "Writing", "Bags", "Desk"]
const fieldClass = "bg-background focus-visible:ring-ring/50 mt-1.5 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px] aria-[invalid=true]:border-destructive"

type AtlasProductsProps = React.ComponentProps<"div"> & { hrefs?: Partial<AtlasHrefs> }

/** The Atlas products page: search, category and low-stock filters, grid or list, quick stock edits and an add-product drawer with validation. */
function AtlasProducts({ hrefs, ...props }: AtlasProductsProps) {
  const [items, setItems] = React.useState<AtlasProduct[]>(seed)
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("all")
  const [lowOnly, setLowOnly] = React.useState(false)
  const [view, setView] = React.useState<View>("grid")
  const [open, setOpen] = React.useState(false)
  const [errors, setErrors] = React.useState<{ name?: string; price?: string }>({})

  const q = query.trim().toLowerCase()
  const shown = items.filter((p) => (category === "all" || p.category === category) && (!lowOnly || p.stock <= 10) && (!q || p.name.toLowerCase().includes(q)))
  const lowCount = items.filter((p) => p.stock <= 10).length

  function adjust(id: string, by: number) {
    setItems((all) => all.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + by) } : p)))
  }
  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get("name") ?? "").trim()
    const price = Number(f.get("price"))
    const next: typeof errors = {}
    if (!name) next.name = "Give the product a name."
    if (!(price > 0)) next.price = "Enter a price above $0."
    setErrors(next)
    if (next.name || next.price) {
      ;(e.currentTarget.elements.namedItem(next.name ? "name" : "price") as HTMLElement | null)?.focus()
      return
    }
    setItems((all) => [{ id: `p-new-${all.length}`, name, category: String(f.get("category")), price, stock: Number(f.get("stock")) || 0, status: f.get("status") === "draft" ? "draft" : "active", hue: 180 + all.length * 17, sold: 0 }, ...all])
    setOpen(false)
  }

  return (
    <AtlasShell page="products" title="Products" hrefs={hrefs} actions={<button type="button" onClick={() => setOpen(true)} className={cn(atlasButton.primary, "hidden sm:inline-flex")}><Plus aria-hidden="true" /> Add product</button>} {...props}>
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        <AtlasPageHeader title="Products" description={`${items.length} products · ${lowCount} need restocking`}>
          <button type="button" onClick={() => setOpen(true)} className={cn(atlasButton.primary, "sm:hidden")}><Plus aria-hidden="true" /> Add product</button>
        </AtlasPageHeader>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1 sm:max-w-xs">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2" aria-hidden="true" />
            <input type="search" aria-label="Search products" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="bg-card focus-visible:ring-ring/50 placeholder:text-muted-foreground h-9 w-full rounded-lg border pe-3 ps-9 text-sm outline-none focus-visible:ring-[3px]" />
          </div>
          <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-card focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button type="button" aria-pressed={lowOnly} onClick={() => setLowOnly((v) => !v)} className={cn("focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]", lowOnly ? "bg-accent border-foreground/30" : "bg-card hover:bg-accent")}>
            Low stock <span className="text-muted-foreground ms-1 tabular-nums">{lowCount}</span>
          </button>
          <SegmentedControl aria-label="Layout" value={view} onValueChange={(v) => setView(v as View)} size="sm" className="ms-auto">
            <SegmentedControlItem value="grid" aria-label="Grid view"><LayoutGrid /></SegmentedControlItem>
            <SegmentedControlItem value="list" aria-label="List view"><List /></SegmentedControlItem>
          </SegmentedControl>
        </div>
        <p className="sr-only" role="status">{shown.length} products shown</p>

        {shown.length === 0 ? (
          <div className="bg-card text-muted-foreground rounded-xl border px-6 py-20 text-center text-sm">No products match these filters.</div>
        ) : view === "grid" ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((p) => (
              <li key={p.id} className="bg-card group rounded-xl border p-3 transition-shadow hover:shadow-md">
                <ProductTile hue={p.hue} className="aspect-[4/3] w-full" />
                <div className="mt-3 px-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm leading-snug font-semibold text-pretty">{p.name}</h3>
                    {p.status === "draft" && <Badge variant="secondary">Draft</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">{p.category}</p>
                  <div className="mt-3 flex items-center justify-between"><p className="font-bold tabular-nums">{moneyExact.format(p.price)}</p><Stock p={p} /></div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-card overflow-hidden rounded-xl border">
            <div tabIndex={0} role="region" aria-label="Products table" className="focus-visible:ring-ring/50 overflow-x-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
              <table className="w-full min-w-[40rem] text-start text-sm">
                <caption className="sr-only">Products</caption>
                <thead><tr className="text-muted-foreground bg-surface border-b text-xs">{["Product", "Category", "Status", "Price", "Stock"].map((c, i) => <th key={c} scope="col" className={cn("px-4 py-2.5 font-semibold", i === 3 && "text-end", i === 4 && "text-end")}>{c}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {shown.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/40">
                      <td className="px-4 py-2.5"><span className="flex items-center gap-3"><ProductTile hue={p.hue} className="size-9 shrink-0" /><span className="font-semibold">{p.name}</span></span></td>
                      <td className="text-muted-foreground px-4 py-2.5">{p.category}</td>
                      <td className="px-4 py-2.5"><Badge status={p.status === "active" ? "success" : "neutral"} variant="outline">{p.status === "active" ? "Active" : "Draft"}</Badge></td>
                      <td className="px-4 py-2.5 text-end font-semibold tabular-nums">{moneyExact.format(p.price)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" aria-label={`Remove one ${p.name}`} onClick={() => adjust(p.id, -1)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md border outline-none focus-visible:ring-[3px]"><Minus className="size-3.5" aria-hidden="true" /></button>
                          <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">{p.stock}</span>
                          <button type="button" aria-label={`Add one ${p.name}`} onClick={() => adjust(p.id, 1)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md border outline-none focus-visible:ring-[3px]"><Plus className="size-3.5" aria-hidden="true" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) setErrors({}) }}>
        <SheetContent side="end" className="w-full sm:max-w-md" closeLabel="Close">
          <form onSubmit={add} noValidate className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Add product</SheetTitle>
              <SheetDescription>New products start as active and appear in your store right away.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
              <div>
                <label htmlFor="ap-name" className="text-sm font-medium">Name</label>
                <input id="ap-name" name="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "ap-name-err" : undefined} className={fieldClass} />
                {errors.name && <p id="ap-name-err" className="text-destructive mt-1.5 text-sm">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="ap-cat" className="text-sm font-medium">Category</label>
                <select id="ap-cat" name="category" className={fieldClass}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ap-price" className="text-sm font-medium">Price (USD)</label>
                  <input id="ap-price" name="price" type="number" step="0.01" min="0" inputMode="decimal" aria-invalid={!!errors.price} aria-describedby={errors.price ? "ap-price-err" : undefined} className={fieldClass} />
                  {errors.price && <p id="ap-price-err" className="text-destructive mt-1.5 text-sm">{errors.price}</p>}
                </div>
                <div>
                  <label htmlFor="ap-stock" className="text-sm font-medium">Stock</label>
                  <input id="ap-stock" name="stock" type="number" min="0" defaultValue="0" className={fieldClass} />
                </div>
              </div>
              <div>
                <label htmlFor="ap-status" className="text-sm font-medium">Status</label>
                <select id="ap-status" name="status" className={fieldClass}><option value="active">Active</option><option value="draft">Draft</option></select>
              </div>
            </div>
            <SheetFooter>
              <button type="button" className={atlasButton.outline} onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className={atlasButton.primary}>Add product</button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </AtlasShell>
  )
}

export { AtlasProducts, type AtlasProductsProps }
