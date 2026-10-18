import { inlineHtml, inlineText } from "./changelog-inline"
import { getChangelog } from "./changelog"
import { CHANGELOG_GROUPS, publishedAt, type ChangelogEntry } from "./changelog-shared"
import { SITE_URL } from "./site-url"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`

export const entryUrl = (e: ChangelogEntry) => `${SITE_URL}/changelog/${e.slug}`

/** The whole entry as HTML for readers that show the full text. */
export function entryHtml(e: ChangelogEntry): string {
  const picture = e.image ? `<p><img src="${esc(SITE_URL + e.image.light)}" alt="${esc(e.image.alt)}" width="1280" height="800"></p>` : ""
  const groups = CHANGELOG_GROUPS.filter((g) => e.groups[g.key])
    .map((g) => `<h3>${g.heading}</h3><ul>${e.groups[g.key]!.map((b) => `<li>${inlineHtml(b, SITE_URL)}</li>`).join("")}</ul>`)
    .join("")
  return `<p>${esc(e.summary)}</p>${picture}${groups}`
}

export function rssXml(entries = getChangelog()): string {
  const updated = entries.length ? publishedAt(entries[0]!).toUTCString() : new Date(0).toUTCString()
  const items = entries
    .map(
      (e) => `    <item>
      <title>${esc(e.title)}</title>
      <link>${entryUrl(e)}</link>
      <guid isPermaLink="true">${entryUrl(e)}</guid>
      <pubDate>${publishedAt(e).toUTCString()}</pubDate>
${e.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
      <description>${esc(e.summary)}</description>
      <content:encoded>${cdata(entryHtml(e))}</content:encoded>
    </item>`
    )
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Ballmac UI changelog</title>
    <link>${SITE_URL}/changelog</link>
    <atom:link href="${SITE_URL}/changelog/rss.xml" rel="self" type="application/rss+xml"/>
    <description>New components, blocks, CLI and MCP releases, and docs from Ballmac UI, newest first.</description>
    <language>en</language>
    <lastBuildDate>${updated}</lastBuildDate>
${items}
  </channel>
</rss>
`
}

export function atomXml(entries = getChangelog()): string {
  const updated = entries.length ? publishedAt(entries[0]!).toISOString() : new Date(0).toISOString()
  const items = entries
    .map(
      (e) => `  <entry>
    <title>${esc(e.title)}</title>
    <link rel="alternate" type="text/html" href="${entryUrl(e)}"/>
    <id>${entryUrl(e)}</id>
    <published>${publishedAt(e).toISOString()}</published>
    <updated>${publishedAt(e).toISOString()}</updated>
${e.tags.map((t) => `    <category term="${esc(t)}"/>`).join("\n")}
    <summary>${esc(inlineText(e.summary))}</summary>
    <content type="html">${esc(entryHtml(e))}</content>
  </entry>`
    )
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Ballmac UI changelog</title>
  <subtitle>New components, blocks, CLI and MCP releases, and docs from Ballmac UI, newest first.</subtitle>
  <link rel="self" type="application/atom+xml" href="${SITE_URL}/changelog/atom.xml"/>
  <link rel="alternate" type="text/html" href="${SITE_URL}/changelog"/>
  <id>${SITE_URL}/changelog</id>
  <updated>${updated}</updated>
  <author><name>Ballmac</name></author>
${items}
</feed>
`
}
