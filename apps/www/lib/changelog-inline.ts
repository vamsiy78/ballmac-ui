/** A changelog bullet as HTML or plain text, for feeds and search. The page renders it with components/changelog/inline.tsx. */
/** The same bullet as HTML for feeds, with site-relative links made absolute. */
export function inlineHtml(text: string, site: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  return text
    .split(/(\[[^\]]+\]\([^)\s]+\)|`[^`]+`)/)
    .map((p) => {
      const link = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (link) return `<a href="${esc(link[2]!.startsWith("/") ? site + link[2] : link[2]!)}">${esc(link[1]!.replace(/`/g, ""))}</a>`
      const code = p.match(/^`([^`]+)`$/)
      return code ? `<code>${esc(code[1]!)}</code>` : esc(p)
    })
    .join("")
}

/** The same bullet as plain text. */
export function inlineText(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1").replace(/`/g, "")
}
