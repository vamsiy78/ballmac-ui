import "server-only"

import { existsSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

export type Download = {
  slug: string
  title: string
  description: string
  version?: string
  files: { label: string; href: string; size: string }[]
}

const STARTERS: Record<string, { title: string; description: string }> = {
  "beacon-saas": { title: "Beacon SaaS", description: "A complete SaaS app: sign-in, workspaces with teams and invitations, Stripe billing, a dashboard, settings and API keys." },
  "quire-ai": { title: "Quire", description: "An AI assistant that answers from your documents and cites its sources, with sign-in, billing and a library." },
}
const KITS: Record<string, { title: string; description: string }> = {
  "ballmac-figma-tokens": { title: "Figma design tokens", description: "Every Ballmac theme as W3C design tokens, light and dark, ready for Tokens Studio." },
}

const size = (bytes: number) => (bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`)

function scan(dir: "starters" | "kits", known: Record<string, { title: string; description: string }>): Download[] {
  const root = join(process.cwd(), ".registry-pro", dir)
  if (!existsSync(root)) return []
  const groups = new Map<string, Download>()
  for (const file of readdirSync(root).sort()) {
    const m = file.match(/^([a-z0-9]+(?:-[a-z0-9]+)*?)(?:-(\d+\.\d+\.\d+))?\.(zip|tar\.gz)$/)
    if (!m || (!m[2] && readdirSync(root).some((f) => f.startsWith(`${m[1]}-`) && /-\d+\.\d+\.\d+\./.test(f)))) continue // the unversioned copy duplicates the versioned one
    const [, slug, version, ext] = m
    const meta = known[slug!] ?? { title: slug!.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()), description: "" }
    const entry = groups.get(slug!) ?? { slug: slug!, ...meta, version, files: [] }
    entry.files.push({ label: ext === "zip" ? ".zip" : ".tar.gz", href: `/api/pro/download/${dir}/${file}`, size: size(statSync(join(root, file)).size) })
    groups.set(slug!, entry)
  }
  return [...groups.values()].map((g) => ({ ...g, files: g.files.sort((a, b) => a.label.localeCompare(b.label)) }))
}

/** The starter apps and kits in this build's private registry, with browser download links. Empty when Pro is not part of the build. */
export const proDownloads = () => ({ starters: scan("starters", STARTERS), kits: scan("kits", KITS) })
