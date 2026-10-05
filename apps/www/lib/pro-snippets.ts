import { SITE_URL } from "@/lib/site-url"

/** The registry block for components.json that sends the licence key to the Pro registry only. */
export const PRO_REGISTRY_SNIPPET = `{
  "registries": {
    "@ballmac": "${SITE_URL}/r/{name}.json",
    "@ballmac-pro": {
      "url": "${SITE_URL}/r/pro/{name}.json",
      "headers": { "Authorization": "Bearer \${BALLMAC_LICENSE_KEY}" }
    }
  }
}`

/** Install commands for a licence key. `key` is what appears in the text, so a masked copy can be shown while the real one is copied. */
export const proCommands = (key: string) => ({
  env: `BALLMAC_LICENSE_KEY=${key}`,
  claudeCode: `claude mcp add ballmac --env BALLMAC_LICENSE_KEY=${key} -- npx -y @ballmac/mcp`,
  mcpJson: `{
  "mcpServers": {
    "ballmac": {
      "command": "npx",
      "args": ["-y", "@ballmac/mcp"],
      "env": { "BALLMAC_LICENSE_KEY": "${key}" }
    }
  }
}`,
  starter: (slug: string) =>
    `mkdir my-app && curl -fsSL -H "Authorization: Bearer ${key}" ${SITE_URL}/r/pro/starters/${slug}.tar.gz | tar -xz -C my-app --strip-components=1 && cd my-app && pnpm install && pnpm dev`,
})
