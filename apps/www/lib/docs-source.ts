import { loader } from "fumadocs-core/source"
import { pageSchema } from "fumadocs-core/source/schema"
import { applyMdxPreset } from "fumadocs-mdx/config"
import { defineDocs } from "fumadocs-mdx/macro"
import convert from "npm-to-yarn"
import { z } from "zod"

import { transformerMetaHighlight, transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers"

/** ```tsx showLineNumbers marks the block; the stylesheet numbers its lines. */
const transformerLineNumbers = {
  name: "ballmac:line-numbers",
  pre(this: { options: { meta?: { __raw?: string } } }, node: { properties: Record<string, unknown> }) {
    if (/(^|\s)showLineNumbers(\s|$)/.test(this.options.meta?.__raw ?? "")) node.properties["data-line-numbers"] = ""
  },
}

const lines = (cmd: string, to: "pnpm" | "yarn" | "bun") => cmd.split("\n").map((l) => convert(l, to)).join("\n")

/**
 * The docs, written as MDX in content/docs/ and grouped by what the reader needs (Diátaxis):
 * get-started (tutorials), guides (how-to), reference, concepts (explanation). Folder order and titles come from each folder's meta.json.
 *
 * Authoring notes (see docs/STYLE.md):
 *   - ```npm fences become tabs for pnpm, npm, yarn and bun, and the visitor's choice is remembered.
 *   - ```tsx title="app/page.tsx" {2,4-5} adds a file name and highlights lines; `// [!code highlight]` and `// [!code ++]` work inside code.
 *   - <Note>, <Tip> and <Warning> are callouts; <Steps> numbers the h3 headings inside it; <Cards> and <Card> link to pages.
 */
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      /** Pages written by `pnpm docs:generate` carry the path of what they were generated from; they must not be edited by hand. */
      generatedFrom: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }),
    mdxOptions: applyMdxPreset({
      rehypeCodeOptions: {
        themes: { light: "github-light-default", dark: "github-dark-default" },
        defaultColor: false,
        transformers: [transformerLineNumbers, transformerMetaHighlight(), transformerNotationHighlight(), transformerNotationDiff()],
      },
      remarkNpmOptions: {
        persist: { id: "package-manager" },
        packageManagers: [
          { name: "pnpm", command: (cmd: string) => lines(cmd, "pnpm") },
          { name: "npm", command: (cmd: string) => cmd },
          { name: "yarn", command: (cmd: string) => lines(cmd, "yarn") },
          { name: "bun", command: (cmd: string) => lines(cmd, "bun") },
        ],
      },
    }),
  },
})

export const source = loader({ baseUrl: "/docs", source: docs.toFumadocsSource() })
