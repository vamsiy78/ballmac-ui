// Ballmac UI: Goods cart store. https://ui.ballmac.com/templates/template-goods
"use client"

import * as React from "react"

import { productById } from "@/components/ballmac/templates/goods/goods-data"

export type CartLine = { id: string; glaze: number; qty: number }

const KEY = "kiln-bag"
let lines: CartLine[] = []
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (raw) lines = (JSON.parse(raw) as CartLine[]).filter((l) => l && typeof l.id === "string" && l.qty > 0)
  } catch {
    // Storage can be blocked; the bag still works for this page.
  }
}
function commit(next: CartLine[]) {
  lines = next
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  listeners.forEach((l) => l())
}

/** The bag, shared by every page and kept for the browser session. */
export const cart = {
  add(id: string, glaze: number, qty = 1) {
    load()
    const found = lines.find((l) => l.id === id && l.glaze === glaze)
    commit(found ? lines.map((l) => (l === found ? { ...l, qty: Math.min(10, l.qty + qty) } : l)) : [...lines, { id, glaze, qty }])
  },
  setQty(id: string, glaze: number, qty: number) {
    load()
    commit(qty <= 0 ? lines.filter((l) => !(l.id === id && l.glaze === glaze)) : lines.map((l) => (l.id === id && l.glaze === glaze ? { ...l, qty: Math.min(10, qty) } : l)))
  },
  remove(id: string, glaze: number) {
    load()
    commit(lines.filter((l) => !(l.id === id && l.glaze === glaze)))
  },
  clear() {
    load()
    commit([])
  },
}

let promoOn = false
let promoLoaded = false
function loadPromo() {
  if (promoLoaded || typeof window === "undefined") return
  promoLoaded = true
  try {
    promoOn = window.sessionStorage.getItem("kiln-promo") === "1"
  } catch {
    // ignore
  }
}
/** The KILN10 code, kept for the session so the bag and checkout agree. */
export const promo = {
  set(on: boolean) {
    loadPromo()
    promoOn = on
    try {
      window.sessionStorage.setItem("kiln-promo", on ? "1" : "0")
    } catch {
      // ignore
    }
    listeners.forEach((l) => l())
  },
}
export function usePromo() {
  return React.useSyncExternalStore(subscribe, () => { loadPromo(); return promoOn }, () => false)
}

const empty: CartLine[] = []
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => void listeners.delete(cb)
}
/** Lines in the bag, with totals. Empty on the server and first render so markup matches. */
export function useCart() {
  const current = React.useSyncExternalStore(subscribe, () => { load(); return lines }, () => empty)
  const detailed = current.map((l) => ({ ...l, product: productById(l.id) }))
  const count = detailed.reduce((n, l) => n + l.qty, 0)
  const subtotal = detailed.reduce((n, l) => n + l.qty * l.product.price, 0)
  return { lines: detailed, count, subtotal }
}
