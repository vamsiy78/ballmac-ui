import { getOffer } from "@/lib/offer"

/**
 * The pages are built ahead of time, so the price they show is the offer at build time. Every 15 minutes (the Worker's cron) this compares the offer now with
 * the one the deployed pages were built with (/offer-state.json). When they differ (the founding deadline passed, or the founding licences ran out) it starts
 * the deploy workflow, which rebuilds the site with the new offer. The "ends in 3 days" phrases do not need a rebuild: they follow the visitor's clock.
 *
 * Needs GITHUB_DEPLOY_TOKEN (fine-grained, Actions: read and write on DEPLOY_REPO). Without it, it only logs.
 */
export async function offerWatch(env: Env) {
  const deployed = await env.ASSETS.fetch(new Request("https://assets.local/offer-state.json"))
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
  if (!deployed) return console.log("offer-watch: no /offer-state.json in this deploy")
  const current = await getOffer()
  if (JSON.stringify(deployed) === JSON.stringify(current)) return

  const token = env.GITHUB_DEPLOY_TOKEN
  const repo = env.DEPLOY_REPO
  const workflow = env.DEPLOY_WORKFLOW
  if (!token || !repo || !workflow) return console.log("offer-watch: the offer changed, but GITHUB_DEPLOY_TOKEN, DEPLOY_REPO or DEPLOY_WORKFLOW is not set")

  const gh = (path: string, init: RequestInit = {}) =>
    fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}${path}`, {
      ...init,
      headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "user-agent": "ballmac-ui-offer-watch", "x-github-api-version": "2022-11-28", ...init.headers },
    })

  // One rebuild at a time: skip while a deploy is running, or started in the last half hour (it may still be uploading).
  const runs = (await gh("/runs?per_page=5").then((r) => (r.ok ? r.json() : null))) as { workflow_runs?: { status: string; created_at: string }[] } | null
  const busy = runs?.workflow_runs?.some((r) => r.status !== "completed" || Date.now() - Date.parse(r.created_at) < 30 * 60_000)
  if (busy) return console.log("offer-watch: the offer changed; a deploy is already running or just ran")

  const res = await gh("/dispatches", { method: "POST", body: JSON.stringify({ ref: "main", inputs: { target: "production", reason: "The Pro offer changed" } }) })
  console.log(res.ok ? "offer-watch: the offer changed; started a production deploy" : `offer-watch: could not start the deploy (${res.status})`)
}
