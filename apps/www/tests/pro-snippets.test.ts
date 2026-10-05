import { describe, expect, it } from "vitest"

import { PRO_REGISTRY_SNIPPET, proCommands, proRegistrySnippet } from "../lib/pro-snippets"
import { SITE_URL } from "../lib/site-url"

describe("install snippets", () => {
  it("point at production by default and need no extra MCP setting", () => {
    expect(PRO_REGISTRY_SNIPPET).toContain(`"url": "${SITE_URL}/r/pro/{name}.json"`)
    const c = proCommands("KEY")
    expect(c.claudeCode).toBe("claude mcp add ballmac --env BALLMAC_LICENSE_KEY=KEY -- npx -y @ballmac/mcp")
    expect(c.mcpJson).not.toContain("BALLMAC_UI_URL")
    expect(c.starter("beacon-saas")).toContain(`${SITE_URL}/r/pro/starters/beacon-saas.tar.gz`)
  })

  it("follow the site the buyer is on, and tell the MCP server where to read the catalog", () => {
    const origin = "https://preview.example.vercel.app"
    expect(proRegistrySnippet(origin)).toContain(`"@ballmac": "${origin}/r/{name}.json"`)
    expect(proRegistrySnippet(origin)).toContain(`"url": "${origin}/r/pro/{name}.json"`)
    const c = proCommands("KEY", origin)
    expect(c.claudeCode).toContain(`--env BALLMAC_UI_URL=${origin}`)
    expect(JSON.parse(c.mcpJson).mcpServers.ballmac.env).toEqual({ BALLMAC_LICENSE_KEY: "KEY", BALLMAC_UI_URL: origin })
    expect(c.starter("quire-ai")).toContain(`${origin}/r/pro/starters/quire-ai.tar.gz`)
  })

  it("keeps the key placeholder in the registry header, never a real key", () => {
    expect(proRegistrySnippet("https://x.example")).toContain("Bearer ${BALLMAC_LICENSE_KEY}")
  })
})
