/**
 * Base UI variants of registry items.
 *
 * An item has a Base UI variant when a file at the same path exists under registry/ballmac/base/ (components/popover.tsx ->
 * base/components/popover.tsx). The variant is the same item with those files swapped, `radix-ui` replaced by `@base-ui/react`, and its registry
 * dependencies pointing at other Base UI variants. It is built to public/r/base/<name>.json, and the Worker serves it for `/r/{style}/<name>.json`
 * when the style is a Base UI one (base-nova, base-vega, ...).
 *
 * The three helper files only Base UI needs (positioner, slot, fieldset) have no Radix counterpart, so they are listed here, not as items in the
 * catalog.
 */
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import type { LoadedItem } from "./lib"

export const BASE_UI_SPEC = "@base-ui/react@^1.9.0"

export type BaseOnlyItem = { name: string; title: string; description: string; file: string }

export const BASE_ONLY: BaseOnlyItem[] = [
  {
    name: "positioner",
    title: "Positioner helpers (Base UI)",
    description: "Splits Radix-style content props (side, align, sideOffset) into the positioner and popup Base UI needs, and maps onSelect and preventDefault onto Base UI's events.",
    file: "lib/positioner.ts",
  },
  {
    name: "slot",
    title: "Slot (Base UI)",
    description: "Renders its one child with its own props merged in, which is how asChild works on Base UI.",
    file: "lib/slot.tsx",
  },
  {
    name: "menubar-value",
    title: "Menubar value (Base UI)",
    description: "Keeps Radix UI's menubar value, defaultValue and onValueChange on Base UI's menubar, so a bar can say which menu is open.",
    file: "lib/menubar-value.tsx",
  },
  {
    name: "fieldset",
    title: "Fieldset disabled (Base UI)",
    description: "Lets Base UI's switch, checkbox and radio follow a disabled fieldset, as native controls do.",
    file: "lib/fieldset.ts",
  },
]

/** The Base UI file for an item file, when there is one. */
export function baseFile(baseDir: string, path: string) {
  const file = join(baseDir, "base", path)
  return existsSync(file) ? file : null
}

/** Import path a Base-only file is reachable at once installed: lib/slot.tsx -> @/lib/ballmac/slot */
export function baseOnlyImport(item: BaseOnlyItem) {
  return `@/${item.file.replace(/\.(tsx?)$/, "").replace(/^lib\//, "lib/ballmac/")}`
}

export type BaseVariant = {
  item: LoadedItem
  /** Item file path -> the Base UI file on disk. Files without a Base UI counterpart are kept as they are. */
  swaps: Map<string, string>
  /** Base-only helpers the swapped files import. */
  helpers: string[]
}

export function findVariants(items: LoadedItem[]) {
  const variants = new Map<string, BaseVariant>()
  for (const item of items) {
    const swaps = new Map<string, string>()
    for (const f of item.files) {
      const file = baseFile(item.baseDir, f.path)
      if (file) swaps.set(f.path, file)
    }
    if (!swaps.size) continue
    const code = [...swaps.values()].map((f) => readFileSync(f, "utf8")).join("\n")
    const helpers = BASE_ONLY.filter((h) => code.includes(`"${baseOnlyImport(h)}"`)).map((h) => h.name)
    variants.set(item.name, { item, swaps, helpers })
  }
  return variants
}

/** npm packages for the variant: Radix UI out, Base UI in. */
export function baseDependencies(dependencies: string[]) {
  const kept = dependencies.filter((d) => !/^(radix-ui|@radix-ui\/)/.test(d))
  return [...kept, BASE_UI_SPEC]
}
