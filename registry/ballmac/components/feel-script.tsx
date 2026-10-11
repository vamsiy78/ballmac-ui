// Ballmac UI: Feel Script. https://ui.ballmac.com/docs/feels
import { feelScript } from "@/lib/ballmac/feel"

/**
 * Put this once in the document head. It sets `data-feel` on `<html>` before the first paint, from the remembered choice or the
 * device's own platform, so the right feel is there from the first frame. In Next.js, render it inside `<head>` in the root
 * layout and add `suppressHydrationWarning` to `<html>`.
 */
export function FeelScript() {
  return <script dangerouslySetInnerHTML={{ __html: feelScript }} />
}
