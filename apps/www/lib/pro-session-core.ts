/**
 * Browser sessions for Ballmac UI Pro, with no Next.js imports so it can be tested on its own.
 *
 * A buyer pastes their licence key once on /pro. The key is sealed (AES-256-GCM, secret from PRO_SESSION_SECRET) into an httpOnly
 * cookie, so scripts on the page can never read it. Every request that uses the session opens the cookie and validates the key again
 * through the normal licence check, which means a revoked key stops working within the cache window (ten minutes), not after 30 days.
 * A second cookie, `bm_pro_on`, holds no secret: it only lets the header show "Pro" instead of "Log in" without a network call.
 */
export const SESSION_COOKIE = "bm_pro"
export const FLAG_COOKIE = "bm_pro_on"
export const SESSION_DAYS = 30

const MAX_AGE = SESSION_DAYS * 24 * 60 * 60
const enc = new TextEncoder()
const dec = new TextDecoder()

const toB64 = (bytes: Uint8Array) => {
  let s = ""
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
const fromB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))

async function aesKey(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(`ballmac-pro-session:${secret}`))
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"])
}

/** Seals a licence key into a cookie value. A fresh random IV makes every value different. */
export async function sealSession(key: string, secret: string, now = Date.now()) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const payload = enc.encode(JSON.stringify({ k: key, e: now + MAX_AGE * 1000 }))
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(secret), payload))
  const out = new Uint8Array(iv.length + sealed.length)
  out.set(iv)
  out.set(sealed, iv.length)
  return toB64(out)
}

/** The licence key inside a cookie value, or null when it is malformed, tampered with, sealed with another secret, or expired. */
export async function openSession(token: string | null | undefined, secret: string, now = Date.now()): Promise<string | null> {
  if (!token || !secret || token.length > 2048) return null
  try {
    const raw = fromB64(token)
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.slice(0, 12) }, await aesKey(secret), raw.slice(12))
    const { k, e } = JSON.parse(dec.decode(plain)) as { k?: unknown; e?: unknown }
    if (typeof k !== "string" || typeof e !== "number" || e <= now) return null
    return k
  } catch {
    return null
  }
}

export function readCookie(header: string | null | undefined, name: string) {
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=")
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim()
  }
  return null
}

const attrs = (secure: boolean) => `Path=/; SameSite=Lax${secure ? "; Secure" : ""}`

/** The two Set-Cookie header values that start a session. */
export const startCookies = (token: string, secure: boolean) => [
  `${SESSION_COOKIE}=${token}; Max-Age=${MAX_AGE}; HttpOnly; ${attrs(secure)}`,
  `${FLAG_COOKIE}=1; Max-Age=${MAX_AGE}; ${attrs(secure)}`,
]

/** The two Set-Cookie header values that end a session. */
export const endCookies = (secure: boolean) => [`${SESSION_COOKIE}=; Max-Age=0; HttpOnly; ${attrs(secure)}`, `${FLAG_COOKIE}=; Max-Age=0; ${attrs(secure)}`]

/**
 * Guards the session endpoints against other sites. A change (POST, DELETE) needs an Origin that matches the host. A read (GET) is
 * refused only when the browser says the request came from another site; other clients such as curl send neither header.
 */
export function sameOrigin(headers: Headers, change: boolean) {
  const origin = headers.get("origin")
  if (origin) {
    try {
      const host = new URL(origin).host
      return host === headers.get("x-forwarded-host") || host === headers.get("host")
    } catch {
      return false
    }
  }
  if (change) return false
  const site = headers.get("sec-fetch-site")
  return !site || site === "same-origin" || site === "none"
}

/** A licence key shown as `abcd••••••••wxyz`. */
export function maskKey(key: string) {
  if (key.length <= 12) return "•".repeat(key.length)
  return `${key.slice(0, 4)}${"•".repeat(Math.min(16, key.length - 8))}${key.slice(-4)}`
}
