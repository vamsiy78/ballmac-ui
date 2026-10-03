/**
 * Fetches the private Pro source into registry/pro before a production build.
 *
 *   pnpm pro:fetch
 *
 * Env:
 *   PRO_REPO_TOKEN       fine-grained token, read-only Contents on the Pro repo
 *   PRO_REPO             owner/name (default vamsiy78/ballmac-ui-pro)
 *   PRO_REPO_REF         branch, tag or sha (default main on Vercel production, else preprod)
 *   PRO_FORCE_REFRESH=1  re-fetch even if registry/pro already exists
 *   BALLMAC_REQUIRE_PRO=1  fail when Pro cannot be fetched (always on for Vercel production)
 *
 * The token is passed through git's environment config, never in a URL, argv or .git/config,
 * and the .git directory is removed afterwards so the checkout is plain source.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = join(import.meta.dirname, "..")
const DEST = join(ROOT, "registry/pro")

export type FetchEnv = Record<string, string | undefined>
export type FetchPlan =
  | { action: "skip"; reason: string }
  | { action: "fetch"; repo: string; ref: string; required: boolean }
  | { action: "free-only"; reason: string }
  | { action: "fail"; reason: string }

export function isRequired(env: FetchEnv) {
  return env.VERCEL_ENV === "production" || env.BALLMAC_REQUIRE_PRO === "1"
}

export function planFetch(env: FetchEnv, present: boolean): FetchPlan {
  const required = isRequired(env)
  if (present && env.PRO_FORCE_REFRESH !== "1") return { action: "skip", reason: "registry/pro already present" }
  const token = env.PRO_REPO_TOKEN?.trim()
  if (!token) {
    return required
      ? { action: "fail", reason: "PRO_REPO_TOKEN is not set but Pro is required for this build" }
      : { action: "free-only", reason: "PRO_REPO_TOKEN is not set; building the free registry only" }
  }
  const repo = env.PRO_REPO?.trim() || "vamsiy78/ballmac-ui-pro"
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return { action: "fail", reason: `PRO_REPO "${repo}" is not owner/name` }
  const ref = env.PRO_REPO_REF?.trim() || (env.VERCEL_ENV === "production" ? "main" : "preprod")
  if (!/^[\w./-]+$/.test(ref) || ref.startsWith("-")) return { action: "fail", reason: `PRO_REPO_REF "${ref}" is not a valid ref` }
  return { action: "fetch", repo, ref, required }
}

function git(args: string[], cwd: string, token?: string) {
  const env: NodeJS.ProcessEnv = { ...process.env, GIT_TERMINAL_PROMPT: "0" }
  if (token) {
    const basic = Buffer.from(`x-access-token:${token}`).toString("base64")
    env.GIT_CONFIG_COUNT = "1"
    env.GIT_CONFIG_KEY_0 = "http.https://github.com/.extraheader"
    env.GIT_CONFIG_VALUE_0 = `AUTHORIZATION: basic ${basic}`
  }
  const r = spawnSync("git", args, { cwd, env, encoding: "utf8" })
  if (r.status !== 0) {
    // Never echo stderr verbatim without scrubbing the token.
    const msg = `${r.stderr ?? ""}`.replaceAll(token ?? "\0", "***").trim().split("\n").slice(-3).join(" | ")
    throw new Error(`git ${args[0]} failed: ${msg}`)
  }
  return r.stdout.trim()
}

function countItems() {
  const dir = join(DEST, "ballmac")
  const walk = (d: string): number =>
    readdirSync(d, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".meta.ts") ? 1 : 0), 0)
  return existsSync(dir) ? walk(dir) : 0
}

export function main(env: FetchEnv = process.env) {
  const present = existsSync(join(DEST, "ballmac"))
  const plan = planFetch(env, present)
  if (plan.action === "skip") return console.log(`pro:fetch · ${plan.reason} (${countItems()} items)`)
  if (plan.action === "free-only") return console.warn(`pro:fetch · WARNING ${plan.reason}`)
  if (plan.action === "fail") {
    console.error(`pro:fetch · ERROR ${plan.reason}`)
    process.exit(1)
  }
  const token = env.PRO_REPO_TOKEN!.trim()
  rmSync(DEST, { recursive: true, force: true })
  mkdirSync(DEST, { recursive: true })
  try {
    git(["init", "-q"], DEST)
    git(["remote", "add", "origin", `https://github.com/${plan.repo}.git`], DEST)
    git(["fetch", "-q", "--depth", "1", "origin", plan.ref], DEST, token)
    git(["checkout", "-q", "FETCH_HEAD"], DEST)
    const sha = git(["rev-parse", "--short", "HEAD"], DEST)
    rmSync(join(DEST, ".git"), { recursive: true, force: true })
    console.log(`pro:fetch · ${plan.repo}@${plan.ref} (${sha}) · ${countItems()} items`)
  } catch (e) {
    rmSync(DEST, { recursive: true, force: true })
    console.error(`pro:fetch · ERROR ${(e as Error).message}`)
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
