import { SITE_URL } from "./site-url"

/** The registry block for components.json that sends the licence key to the Pro registry only. `origin` is the site that serves the registry. */
export const proRegistrySnippet = (origin: string = SITE_URL) => `{
  "registries": {
    "@ballmac": "${origin}/r/{name}.json",
    "@ballmac-pro": {
      "url": "${origin}/r/pro/{name}.json",
      "headers": { "Authorization": "Bearer \${BALLMAC_LICENSE_KEY}" }
    }
  }
}`

export const PRO_REGISTRY_SNIPPET = proRegistrySnippet()

/**
 * Install commands for a licence key. `key` is what appears in the text, so a masked copy can be shown while the real one is copied.
 * `origin` is the site the buyer is on: production by default, or a preview, so a preview's commands test that preview. The MCP server
 * reads its catalog from BALLMAC_UI_URL, which is only needed when the origin is not production.
 */
export const proCommands = (key: string, origin: string = SITE_URL) => {
  const custom = origin !== SITE_URL
  return {
    env: `BALLMAC_LICENSE_KEY=${key}`,
    claudeCode: `claude mcp add ballmac --env BALLMAC_LICENSE_KEY=${key}${custom ? ` --env BALLMAC_UI_URL=${origin}` : ""} -- npx -y @ballmac/mcp`,
    mcpJson: `{
  "mcpServers": {
    "ballmac": {
      "command": "npx",
      "args": ["-y", "@ballmac/mcp"],
      "env": { "BALLMAC_LICENSE_KEY": "${key}"${custom ? `, "BALLMAC_UI_URL": "${origin}"` : ""} }
    }
  }
}`,
    starter: (slug: string) =>
      `mkdir my-app && curl -fsSL -H "Authorization: Bearer ${key}" ${origin}/r/pro/starters/${slug}.tar.gz | tar -xz -C my-app --strip-components=1 && cd my-app && pnpm install && pnpm dev`,
  }
}
