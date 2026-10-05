/** Checkout helpers with no framework imports, so they can be tested on their own. */

/**
 * Adds Dodo's `redirect_url` to a payment link so buyers return to /pro on the site they bought from (production, a preview, localhost).
 * A link that already has one is left alone.
 */
export function withRedirect(checkout: string, origin: string) {
  try {
    const url = new URL(checkout)
    if (!url.searchParams.has("redirect_url")) url.searchParams.set("redirect_url", `${origin}/pro`)
    return url.toString()
  } catch {
    return checkout
  }
}

/** True when the page was opened by the checkout redirect or with `?welcome=1`. */
export function cameFromCheckout(params: URLSearchParams) {
  return Boolean(params.get("welcome") || params.get("payment_id") || params.get("status") === "succeeded")
}

/**
 * The licence keys in the redirect Dodo sends after a payment (`license_key`, comma separated when a product issues several).
 * Nothing is returned unless the payment succeeded.
 */
export function keysFromReturn(params: URLSearchParams) {
  const status = params.get("status")
  if (status && status !== "succeeded") return []
  return (params.get("license_key") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0 && k.length <= 200)
    .slice(0, 5)
}
