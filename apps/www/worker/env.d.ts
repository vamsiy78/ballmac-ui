// The Worker's bindings and settings. Secrets (DODO_API_KEY, RESEND_API_KEY, PRO_SESSION_SECRET, ...) are read through process.env by the shared lib code,
// which nodejs_compat fills from them; only what the Worker itself reads is listed here.
interface Env {
  ASSETS: Fetcher
  DEPLOY_ENV?: string
  GITHUB_DEPLOY_TOKEN?: string
  DEPLOY_REPO?: string
  DEPLOY_WORKFLOW?: string
}

// Bundled by worker/build-data.mts (see the rules in wrangler.jsonc).
declare module "*.txt" {
  const text: string
  export default text
}
declare module "*.bin" {
  const data: ArrayBuffer
  export default data
}
declare module "server-only" {}
