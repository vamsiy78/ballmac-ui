# Docs style guide

How we write the pages in `apps/www/content/docs/`. The prose lint (`.vale.ini`, rules in `.vale/styles/Ballmac`) enforces the mechanical parts; the rest is judgement.

## Where a page goes

Every page answers one kind of question. Pick the folder by the question, not by the topic.

| Folder | The reader asks | A page is | Example |
| --- | --- | --- | --- |
| `get-started/` | "Show me it working." | A tutorial: steps in order, ending in something that runs. | Install your first component |
| `guides/` | "How do I do this one thing?" | A how-to: the steps for a task, nothing else. | Update components without losing your edits |
| `reference/` | "What exactly does this take?" | Facts in tables and signatures, complete and dry. | CLI commands |
| `concepts/` | "Why does it work this way?" | An explanation: the ideas and the trade-offs, no steps. | How motion works |

If a page does two of these, split it and link the halves. A guide that stops to explain a concept links to the concept page. A concept page that needs a command links to the guide.

## Voice

- Write to the reader: "you", never "the user" or "developers".
- Use the imperative in headings and steps: "Install the package", "Set the direction". Never "How to install" or "Using the CLI".
- Headings are sentence case. Names keep their own case (Tauri, macOS, MCP).
- Say what is true and what to do. Drop "simply", "just", "easy", "obviously", "please", "very".
- Prefer short paragraphs: one idea each, two or three sentences. Put a list or a table where there is a list or a table.
- One idea per page. If the title needs "and", it is probably two pages.

## Code first

Show the command or the code before you explain it. Explain only what the code doesn't say.

- Install commands use a `npm` fence. The site turns it into tabs for pnpm, npm, yarn and bun, and remembers the reader's choice.
- Give a file a name with `title="app/layout.tsx"` on the fence.
- Highlight a line with `// [!code highlight]`, a range with `{2,4-6}` after the language, and a diff with `// [!code ++]` and `// [!code --]`.
- Number lines with `showLineNumbers` when the text refers to them.
- Use real names from the registry (`@ballmac/button`), real props and real output. Don't invent features, flags or output.

````mdx
```npm
npx shadcn@latest add @ballmac/button
```

```tsx title="app/page.tsx" {3}
import { Button } from "@/components/ballmac/button"

export default function Page() {
  return <Button>Get started</Button> // [!code highlight]
}
```
````

## Callouts, steps and cards

```mdx
<Note>Something the reader should know.</Note>
<Tip>A shortcut or a better way.</Tip>
<Warning>Something that loses work or breaks if ignored.</Warning>

<Steps>

### First step

Text and code.

### Second step

</Steps>

<Cards>
  <Card href="/docs/guides/states" title="Handle states">One line about the page.</Card>
</Cards>
```

Use callouts sparingly: at most two on a page. A callout is never the only place a fact appears.

## Links

- Link to pages with a site-relative path (`/docs/guides/pro`). The tests check that the page and the `#heading` exist.
- Link text says where it goes: "the [MCP tools reference](/docs/reference/mcp-tools)", not "click here".
- Give a heading a stable id when other pages or published packages link to it: `## Where files go [#where-files-go]`.

## Frontmatter

```yaml
---
title: Install your first component   # at most 60 characters, no trailing full stop
description: One sentence, ending in a full stop, that says what the reader gets. # at most 260 characters
---
```

The title is the page's `h1`, so start the page with text, not a heading. Start sections at `##`.

## Reference pages are generated

Pages in `reference/` that carry `generatedFrom:` in their frontmatter are written by `scripts/docs-reference.ts` from the code: the CLI help, the check rules, the MCP server's own tool list, the theme engine, the registry build. Never edit them by hand.

```bash
pnpm build:registry     # the messages, block states and props come from this
pnpm docs:generate      # rewrite the generated pages
pnpm docs:generate --check   # fail if a committed page differs from the code (runs in pnpm check)
```

To change what a generated page says, change its source: a `description` in the MCP server, a doc comment on a type in the theme engine, a rule in `packages/audit/src/rules/meta.ts`. To change how a page looks, change the generator.

`reference/registry` and `reference/theme-tokens` are written by hand because they describe conventions, not code.

## Adding or moving a page

1. Add the `.mdx` file, and add its name to the folder's `meta.json` (a test fails when a page isn't listed).
2. If you move or rename a page, add the old address to `apps/www/content/docs-redirects.json`. Published packages and other sites still link to old addresses.
3. Run the checks:

```bash
pnpm --filter @ballmac-ui/www test      # frontmatter, meta.json, every link and #heading
vale apps/www/content                   # prose rules
```

CI also runs the link checker (`lychee.toml`) over the built site.

## The changelog

Changelog entries are Markdown files in `apps/www/content/changelog/`, one per release or wave, written for the people who use the library. See "Changelog and releases" in `CONTRIBUTING.md`.
