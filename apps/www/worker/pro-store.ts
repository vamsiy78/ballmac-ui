import type { ProSource } from "@/lib/pro-source"

import { archives, items, registry } from "./generated/pro"

// The private Pro build, bundled into the Worker by worker/build-data.mts. Callers check the licence first: these return the code itself.
const own = <T>(table: Record<string, T>, key: string) => (Object.hasOwn(table, key) ? table[key]! : null)

/** The shadcn registry JSON for /r/pro/<name>.json, or null. */
export const readProRegistry = (file: string) => own(registry, file)

/** An item's files with highlighted HTML, or null for a name that is not a Pro item. */
export function readProItem(name: string): ProSource | null {
  const body = own(items, name)
  return body === null ? null : (JSON.parse(body) as ProSource)
}

/** A starter app or kit archive, or null. A copy, so a response body can never detach the bundled buffer. */
export const readProArchive = (dir: string, file: string) => own(archives, `${dir}/${file}`)?.slice(0) ?? null
