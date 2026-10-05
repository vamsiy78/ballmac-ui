/**
 * The address the built registry uses for the free items it depends on (and for homepage links).
 * REGISTRY_URL wins. A Vercel preview build uses its own stable branch address (VERCEL_BRANCH_URL), so a preview is
 * self-contained and installing a Pro item from it finds its free dependencies on the same site. Anything else is production.
 */
export const PRODUCTION_URL = "https://ui.ballmac.com"

export function registryUrl(env: Record<string, string | undefined>) {
  const explicit = env.REGISTRY_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")
  if (env.VERCEL_ENV === "preview" && env.VERCEL_BRANCH_URL?.trim()) return `https://${env.VERCEL_BRANCH_URL.trim()}`
  return PRODUCTION_URL
}
