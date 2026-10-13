/**
 * The address the built registry uses for the free items it depends on (and for homepage links).
 * REGISTRY_URL wins: the preview deploy sets it to the preview's own address (https://preprod.ui.ballmac.com), so a preview is
 * self-contained and installing a Pro item from it finds its free dependencies on the same site. Anything else is production.
 */
export const PRODUCTION_URL = "https://ui.ballmac.com"

export function registryUrl(env: Record<string, string | undefined>) {
  const explicit = env.REGISTRY_URL?.trim()
  return explicit ? explicit.replace(/\/$/, "") : PRODUCTION_URL
}
