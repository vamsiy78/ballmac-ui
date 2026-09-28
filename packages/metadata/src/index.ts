export * from "./schema"

import type { ItemMetaInput } from "./schema"

/** Typed helper for authoring `<name>.meta.ts` files. Validation happens at build time. */
export function defineItem(meta: ItemMetaInput): ItemMetaInput {
  return meta
}
