import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "code-block",
  type: "registry:ui",
  title: "Code Block",
  description:
    "A code panel with filename and language header, line numbers, highlighted lines, a wrap toggle, copy feedback and file tabs. No highlighter bundled; pass Shiki output as children.",
  category: "developer",
  tags: ["code", "snippet", "syntax", "copy", "shiki", "tabs", "developer", "docs"],
  files: [{ path: "components/code-block.tsx" }],
  dependencies: ["lucide-react", "radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "code-block-demo", title: "Default", file: "code-block-demo.tsx" },
    { name: "code-block-tabs", title: "File tabs", file: "code-block-tabs.tsx" },
  ],
  ai: {
    summary:
      "<CodeBlock code filename language lineNumbers highlight={[2,3]} /> renders plain monospace text. For syntax colors, highlight on the server (e.g. Shiki) and pass the result as children plus the raw code for copying. <CodeBlockTabs files={[…]}> shows several files.",
    whenToUse: [
      "Code samples in docs, READMEs rendered on the web and blog posts",
      "Showing a changed file with specific lines highlighted",
      "Several related files (component, usage, config) in one panel with tabs",
    ],
    whenNotToUse: [
      "One-line install commands for several package managers (use install-tabs)",
      "Terminal sessions with prompts and output (use terminal)",
      "Editable code (use a code editor)",
    ],
    composesWith: ["install-tabs", "terminal", "ai-message"],
    a11y: [
      { keys: "Tab", action: "Focuses the scrollable code region (arrow keys scroll long lines), then wrap and copy buttons" },
      { keys: "← / →", action: "In CodeBlockTabs, moves between file tabs" },
      { keys: "—", action: "Copying announces 'Copied to clipboard' through a polite live region" },
    ],
    customization: [
      "code (plain text) or children (pre-highlighted markup). Line numbers use a CSS counter on .line spans, which is also what Shiki emits",
      "highlight: 1-based line numbers (plain code only; with Shiki use its notation transformers)",
      "wrap (initial) and wrapToggle; copyable={false} hides copy",
      "bodyClassName for a max height, e.g. 'max-h-80'",
      "Shiki: const html = await codeToHtml(code, { lang, themes }) then <CodeBlock code={code} language={lang}><div dangerouslySetInnerHTML={{ __html: html }} /></CodeBlock>",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
