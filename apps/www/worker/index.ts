/**
 * The ui.ballmac.com Worker. Every page is a static file served by Cloudflare straight from the build (out/), without running this code. The Worker
 * answers only the routes that need a request: licence checks, the Pro registry and downloads, the forms, and the custom theme link. Which paths reach
 * it is set by `assets.run_worker_first` in wrangler.jsonc; keep that list and ROUTES below in step.
 */
import { offerWatch } from "./offer-watch"
import * as apiPreset from "./routes/api-preset"
import * as changelogSubscribe from "./routes/changelog-subscribe"
import * as docsFeedback from "./routes/docs-feedback"
import * as licenseVerify from "./routes/license-verify"
import { kits, starters } from "./routes/pro-archives"
import * as proDownload from "./routes/pro-download"
import * as proFounders from "./routes/pro-founders"
import * as proItems from "./routes/pro-items"
import * as proRegistry from "./routes/pro-registry"
import * as proSession from "./routes/pro-session"
import * as reminders from "./routes/reminders"
import * as sampler from "./routes/sampler"
import * as stars from "./routes/stars"
import * as support from "./routes/support"
import * as preset from "./routes/preset"
import * as themeCustom from "./routes/theme-custom"

/** A handler that returns undefined declines the request, and it goes to the next route or the static files. */
type Handler = (req: Request, ctx: { params: Promise<Record<string, string>> }) => Response | undefined | Promise<Response | undefined>
type Methods = Partial<Record<"GET" | "POST" | "DELETE", Handler>>

const ROUTES: [URLPattern, Methods][] = [
  ["/api/pro/session", proSession],
  ["/api/pro/founders", proFounders],
  ["/api/pro/items/:name", proItems],
  ["/api/pro/download/:dir/:file", proDownload],
  ["/api/changelog-subscribe", changelogSubscribe],
  ["/api/docs-feedback", docsFeedback],
  ["/api/reminders", reminders],
  ["/api/sampler", sampler],
  ["/api/stars", stars],
  ["/api/support", support],
  ["/api/v1/license/verify", licenseVerify],
  ["/api/v1/preset", apiPreset],
  ["/r/pro/starters/:file", { GET: starters }],
  ["/r/pro/kits/:file", { GET: kits }],
  ["/r/pro/:name", proRegistry],
  ["/r/:file(preset-.+)", preset],
  ["/themes/custom.json", themeCustom],
].map(([pathname, methods]) => [new URLPattern({ pathname: pathname as string }), methods as Methods])

// The same headers the static pages get from _headers, for the Worker's own answers.
const SECURITY: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
}

async function route(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url)
  for (const [pattern, methods] of ROUTES) {
    const match = pattern.exec(url)
    if (!match) continue
    const method = (req.method === "HEAD" ? "GET" : req.method) as keyof Methods
    const handler = methods[method]
    if (!handler) return new Response(null, { status: 405, headers: { allow: Object.keys(methods).join(", ") } })
    const params = Object.fromEntries(Object.entries(match.pathname.groups).map(([k, v]) => [k, decodeURIComponent(v ?? "")]))
    const res = await handler(req, { params: Promise.resolve(params) })
    if (res) return res
  }
  // A path listed in run_worker_first that no route answers: hand it to the static files (their 404 page, usually).
  return env.ASSETS.fetch(req)
}

export default {
  async fetch(req, env) {
    let res: Response
    try {
      res = await route(req, env)
    } catch (err) {
      console.error("worker:", err instanceof Error ? (err.stack ?? err.message) : err)
      res = Response.json({ error: "Something went wrong. Please try again." }, { status: 500, headers: { "cache-control": "no-store" } })
    }
    const headers = new Headers(res.headers)
    for (const [k, v] of Object.entries(SECURITY)) if (!headers.has(k)) headers.set(k, v)
    return new Response(req.method === "HEAD" ? null : res.body, { status: res.status, statusText: res.statusText, headers })
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(offerWatch(env))
  },
} satisfies ExportedHandler<Env>
