import { decodeSpec, themeRegistryItem } from "@ballmac-ui/theme-engine"

export const dynamic = "force-dynamic"

/**
 * An installable theme made from the builder's link parameters: `shadcn add "https://ui.ballmac.com/themes/custom.json?h=262&c=0.19"`.
 * Every value is clamped by the theme engine, so any input produces a safe, accessible theme. Nothing is stored.
 */
export function GET(request: Request) {
  const spec = decodeSpec(new URL(request.url).searchParams)
  const item = themeRegistryItem(spec, {
    name: "theme-custom",
    title: "Custom Ballmac theme",
    description: "A custom theme made with the Ballmac UI theme builder.",
    docs: "Open the builder to keep tuning it: https://ui.ballmac.com/themes",
  })
  return Response.json(item, {
    headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  })
}
