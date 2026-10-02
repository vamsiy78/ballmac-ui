# @ballmac/mcp

An [MCP](https://modelcontextprotocol.io) server for [Ballmac UI](https://ui.ballmac.com). It lets Claude, Cursor, VS Code, Windsurf, Codex and any other MCP client search the catalog of components, blocks and templates, read an item's props, keyboard behaviour and source, get the exact install command, and plan whole pages from blocks.

It is read-only: it answers questions and returns commands, and never writes files or runs anything on your machine. No account or API key is needed for the free catalog.

## Install

The server runs with `npx`, so there is nothing to install globally. Node.js 20 or later is required.

### Claude Code

```bash
claude mcp add ballmac -- npx -y @ballmac/mcp
```

### Claude Desktop

Add this to `claude_desktop_config.json` (Settings, Developer, Edit config):

```json
{
  "mcpServers": {
    "ballmac": {
      "command": "npx",
      "args": ["-y", "@ballmac/mcp"]
    }
  }
}
```

### Cursor

Add this to `.cursor/mcp.json` in your project, or to `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "ballmac": {
      "command": "npx",
      "args": ["-y", "@ballmac/mcp"]
    }
  }
}
```

### VS Code

Add this to `.vscode/mcp.json`:

```json
{
  "servers": {
    "ballmac": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@ballmac/mcp"]
    }
  }
}
```

### Windsurf

Add the same `mcpServers` block as Cursor to `~/.codeium/windsurf/mcp_config.json`.

### Codex

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.ballmac]
command = "npx"
args = ["-y", "@ballmac/mcp"]
```

## What it can do

| Tool | What it returns |
| --- | --- |
| `search_items` | The best matches for a need, such as "chat input with attachments" or "online store". Understands common synonyms (modal, navbar, ecommerce). |
| `list_items` | Components, blocks or templates, filtered by kind, category or tier. |
| `list_categories` | Totals and every category with its count, so the agent knows what exists. |
| `get_item` | Description, when to use and when not to, import line, props, keyboard behaviour, dependencies, template pages and the full source. |
| `get_examples` | The working examples shown on the item's page. |
| `get_install_command` | The shadcn CLI commands for pnpm, npm, yarn or bun. |
| `compose_page` | A page plan from blocks in the right order, install commands, a `page.tsx` scaffold, and any complete template that already fits. |
| `get_setup` | How to prepare a project (shadcn init, registry entry, optional theme). |

Resources: `ballmac://catalog` (every item with a one-line description) and `ballmac://items/{name}` (one item as Markdown).

Prompts: `build_page` (plan and build a page from an intent) and `choose_component` (find and wire up the right component).

Tools that return lists also return structured content, so clients that support it get typed results.

## Things to ask

- "Build a SaaS landing page with pricing and an FAQ using Ballmac UI."
- "Which Ballmac component should I use for an animated revenue number?"
- "Add a login screen from Ballmac UI to this app."
- "Is there a Ballmac template for an online store? Install it."

## Options

| Variable | Default | Purpose |
| --- | --- | --- |
| `BALLMAC_UI_URL` | `https://ui.ballmac.com` | The catalog to read, for example a local copy of the site. |
| `BALLMAC_LICENSE_KEY` | none | A Ballmac UI Pro licence key. With it, `get_item` and `get_examples` return the source of Pro items too. |

## Pro items

Pro items appear in search with `tier: "pro"`. Their install commands use the `@ballmac-pro` namespace, and `get_install_command` returns a `proSetup` line with the `components.json` entry the shadcn CLI needs. To let the agent read Pro source, pass your key to the server:

```bash
claude mcp add ballmac --env BALLMAC_LICENSE_KEY=your-licence-key -- npx -y @ballmac/mcp
```

In JSON configs, add `"env": { "BALLMAC_LICENSE_KEY": "your-licence-key" }` next to `args`. The key is only sent to the Ballmac UI site. Setup guide: [ui.ballmac.com/docs/pro](https://ui.ballmac.com/docs/pro).

`npx @ballmac/mcp --help` and `--version` work from a terminal.

## Without MCP

Ballmac UI is also a standard shadcn registry, so the official shadcn MCP server can browse it once the registry is in your `components.json`:

```bash
npx shadcn@latest registry add @ballmac=https://ui.ballmac.com/r/{name}.json
```

## License

MIT
