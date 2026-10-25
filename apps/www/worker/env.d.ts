// The Worker's bindings and settings. Secrets (DODO_API_KEY, RESEND_API_KEY, PRO_SESSION_SECRET, ...) are read through process.env by the shared lib code,
// which nodejs_compat fills from them; only what the Worker itself reads is listed here.
interface Env {
  AFFILIATES?: D1Database
  /** The private Pro data (worker/pro-store.ts). Absent when a Worker is built without Pro. */
  PRO_DATA?: R2Bucket
  ASSETS: Fetcher
  DEPLOY_ENV?: string
  GITHUB_DEPLOY_TOKEN?: string
  DEPLOY_REPO?: string
  DEPLOY_WORKFLOW?: string
}

declare module "server-only" {}
