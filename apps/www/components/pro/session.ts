"use client"

import { useSyncExternalStore } from "react"

/**
 * The browser side of the Pro login. The licence key lives in an httpOnly cookie that scripts cannot read; this store only knows
 * whether a session exists (the readable `bm_pro_on` cookie) and, once asked, the key the server hands back for the setup snippets.
 */
export type ProState = { status: "unknown" | "out" | "in"; key?: string }

const OUT: ProState = { status: "out" }
let state: ProState = { status: "unknown" }
let pending: Promise<void> | null = null
const listeners = new Set<() => void>()

const set = (next: ProState) => {
  state = next
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}
const hasFlag = () => /(?:^|;\s*)bm_pro_on=1/.test(document.cookie)

/** True when this browser has a Pro session. Cheap: reads one cookie, no request. Server renders and first paint say false. */
export const useProFlag = () => useSyncExternalStore(subscribe, () => (state.status === "out" ? false : hasFlag() || state.status === "in"), () => false)

/** The full session, including the key once it is known. Call `ensureSession` to find out. */
export const useProSession = () => useSyncExternalStore(subscribe, () => state, () => state)

/** Finds out whether the session is still good (the server checks the key again), once per page load. */
export function ensureSession() {
  if (state.status !== "unknown") return Promise.resolve()
  if (!hasFlag()) {
    set(OUT)
    return Promise.resolve()
  }
  pending ??= fetch("/api/pro/session", { cache: "no-store" })
    .then(async (res) => {
      const data = (await res.json().catch(() => ({}))) as { valid?: boolean; key?: string }
      set(res.ok && data.valid && data.key ? { status: "in", key: data.key } : OUT)
    })
    .catch(() => set(hasFlag() ? { status: "unknown" } : OUT))
    .finally(() => {
      pending = null
    })
  return pending
}

export type LoginResult = { ok: true } | { ok: false; reason: string }

/** Checks a pasted key and starts the session. */
export async function login(rawKey: string): Promise<LoginResult> {
  const key = rawKey.trim()
  try {
    const res = await fetch("/api/pro/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }), cache: "no-store" })
    const data = (await res.json().catch(() => ({}))) as { valid?: boolean; reason?: string }
    if (res.ok && data.valid) {
      set({ status: "in", key })
      return { ok: true }
    }
    return { ok: false, reason: data.reason ?? "This licence key is not valid." }
  } catch {
    return { ok: false, reason: "Could not reach the server. Check your connection and try again." }
  }
}

export async function logout() {
  await fetch("/api/pro/session", { method: "DELETE", cache: "no-store" }).catch(() => {})
  set(OUT)
}

export type ProFile = { path: string; code: string; html: string }
export type ProItem = { name: string; title?: string; description?: string; dependencies: string[]; registryDependencies: string[]; files: ProFile[] }

const items = new Map<string, Promise<ProItem | null>>()
/** The source of a Pro item for the logged-in buyer, or null when there is no valid session. Remembered for the page's lifetime. */
export function fetchProItem(name: string) {
  let hit = items.get(name)
  if (!hit) {
    hit = fetch(`/api/pro/items/${name}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          // The session is no longer valid: asking the session endpoint makes the server clear the stale cookies, so the header stops showing Pro.
          void fetch("/api/pro/session", { cache: "no-store" }).catch(() => {})
          set(OUT)
          return null
        }
        return res.ok ? ((await res.json()) as ProItem) : null
      })
      .catch(() => null)
    items.set(name, hit)
    hit.then((v) => v ?? items.delete(name))
  }
  return hit
}
