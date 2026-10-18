import { SITE_URL } from "@/lib/site-url"

/**
 * An MDX docs page as plain Markdown, for the "Copy page" button, the /md/docs files, llms-full.txt and agents. Only the authoring features
 * listed in lib/docs-source.ts need converting: callouts, steps, cards, install tabs, and code fence extras.
 */
export function mdxToMarkdown(source: string, { title, description }: { title: string; description?: string }, site = SITE_URL): string {
  let body = source.replace(/^---\n[\s\S]*?\n---\n/, "")
  // Install tabs: keep the npm line; the readers of this file know their package manager.
  body = body.replace(/```npm\n([\s\S]*?)```/g, "```bash\n$1```")
  // Code fence extras (file names stay as a title attribute, the rest is for the site only).
  body = body.replace(/^```(\w+)([^\n]*)$/gm, (_m, lang: string, meta: string) => {
    const t = meta.match(/title="([^"]*)"/)
    return t ? `\`\`\`${lang} title="${t[1]}"` : `\`\`\`${lang}`
  })
  body = body.replace(/ *\/\/ \[!code [^\]]+\]/g, "").replace(/ *# \[!code [^\]]+\]/g, "")
  // Callouts become block quotes.
  body = body.replace(/<(Note|Tip|Warning)(?: title="([^"]*)")?>\n?([\s\S]*?)\n?<\/\1>/g, (_m, kind: string, t: string | undefined, text: string) => {
    const label = t ?? kind
    return `> **${label}:** ${text.trim().split("\n").join("\n> ")}`
  })
  body = body.replace(/<\/?Steps>\n?/g, "")
  body = body.replace(/<Cards>\n?([\s\S]*?)<\/Cards>/g, (_m, inner: string) =>
    [...inner.matchAll(/<Card href="([^"]+)" title="([^"]+)"(?:\s*\/>|>([\s\S]*?)<\/Card>)/g)].map((c) => `- [${c[2]}](${c[1]})${c[3] ? `: ${c[3].trim()}` : ""}`).join("\n")
  )
  body = body.replace(/\]\((\/[^)]*)\)/g, `](${site}$1)`)
  body = body.replace(/\n{3,}/g, "\n\n").trim()
  return `# ${title}\n\n${description ? `${description}\n\n` : ""}${body}\n`
}
