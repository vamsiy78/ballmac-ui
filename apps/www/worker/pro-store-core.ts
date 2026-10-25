import type { ProSource } from "@/lib/pro-source"

export type ProTables = { version: string; registryFiles: ReadonlySet<string>; itemNames: ReadonlySet<string>; archiveFiles: ReadonlySet<string> }
/** The part of an R2 bucket this store uses, so the store can be tested without the Workers types. */
export type R2Like = { get(key: string): Promise<{ text(): Promise<string>; body: ReadableStream; size: number } | null> }
type Bucket = { PRO_DATA?: R2Like }

/**
 * Reads the private Pro build from the PRO_DATA R2 bucket (staged by worker/build-data.mts, sent by `pnpm cf:upload`). Callers check the licence first: these return the
 * code itself. The names that exist are built into the Worker, so an unknown name answers null without a read, and a name is never used to build a key unless it is one of them.
 * Keys start with the data version the Worker was built with, so a deploy never reads data that belongs to another build.
 */
export function createProStore(t: ProTables) {
  const key = (kind: "registry" | "items" | "archives", name: string) => `${t.version}/${kind}/${name}`

  async function read(env: Bucket, k: string) {
    if (!env.PRO_DATA) return null
    const object = await env.PRO_DATA.get(k)
    if (!object) console.error(`pro-store: ${k} is missing from the PRO_DATA bucket (run pnpm cf:upload for this build)`)
    return object
  }

  return {
    /** The shadcn registry JSON for /r/pro/<name>.json, or null. */
    async readProRegistry(env: Bucket, file: string): Promise<string | null> {
      if (!t.registryFiles.has(file)) return null
      return (await (await read(env, key("registry", file)))?.text()) ?? null
    },
    /** An item's files with highlighted HTML, or null for a name that is not a Pro item. */
    async readProItem(env: Bucket, name: string): Promise<ProSource | null> {
      if (!t.itemNames.has(name)) return null
      const body = await (await read(env, key("items", `${name}.json`)))?.text()
      return body === undefined ? null : (JSON.parse(body) as ProSource)
    },
    /** A starter app or kit archive as a stream with its size, or null. */
    async readProArchive(env: Bucket, dir: string, file: string): Promise<{ body: ReadableStream; size: number } | null> {
      if (!t.archiveFiles.has(`${dir}/${file}`)) return null
      const object = await read(env, key("archives", `${dir}/${file}`))
      return object ? { body: object.body, size: object.size } : null
    },
  }
}
