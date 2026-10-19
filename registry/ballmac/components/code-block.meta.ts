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
  registryDependencies: ["shadcn:utils", "i18n", "highlight"],
  examples: [
    { name: "code-block-demo", title: "Default", file: "code-block-demo.tsx" },
    { name: "code-block-tabs", title: "File tabs", file: "code-block-tabs.tsx" },
    { name: "code-block-compound", title: "Header, title and actions", file: "code-block-compound.tsx" },
    { name: "code-block-highlighted", title: "Highlighted code and lines", file: "code-block-highlighted.tsx" },
    { name: "code-block-diff", title: "Diff", file: "code-block-diff.tsx" },
    { name: "code-block-floating", title: "Floating actions", file: "code-block-floating.tsx" },
    { name: "code-block-show-more", title: "Show more", file: "code-block-show-more.tsx" },
    { name: "code-block-tool-output", title: "Tool output in a Trace", file: "code-block-tool-output.tsx" },
  ],
  ai: {
    summary:
      "Two ways to use it. Ready-made: <CodeBlock code filename language lineNumbers highlight={[2,3]} /> renders plain monospace text. Compound (the same API as shadcn's Code Block, so chat kits and agent output drop in): <CodeBlock size variant><CodeBlockHeader><CodeBlockTitle/><CodeBlockActions><CodeBlockCopyButton value/></CodeBlockActions></CodeBlockHeader><CodeBlockContent lineNumbers wrap startLine><CodeBlockLine variant=\"added|removed|highlighted\"/></CodeBlockContent><CodeBlockFooter/></CodeBlock>, with useHighlightedCode(code, language) giving one node per line. For syntax colors, highlight on the server (e.g. Shiki) and pass the result as children plus the raw code for copying. <CodeBlockTabs files={[…]}> shows several files.",
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
      "Compound mode: put CodeBlockHeader, CodeBlockActions, CodeBlockContent or CodeBlockFooter directly inside CodeBlock. size=\"sm\" and variant=\"destructive\" suit tool output and errors; CodeBlockActions without a header floats and shows on hover, focus and touch",
      "Shiki: const html = await codeToHtml(code, { lang, themes }) then <CodeBlock code={code} language={lang}><div dangerouslySetInnerHTML={{ __html: html }} /></CodeBlock>",
    ],
  },
  changelog: [
    { version: "1.1.0", date: "2026-10-19", note: "Adds the compound API of shadcn's Code Block: header, title, actions, copy button, content, line and footer parts, size and variant, diff and highlighted lines, start line and a useHighlightedCode hook. The ready-made panel and CodeBlockTabs are unchanged." },
  ],
  version: "1.1.0",
  updated: "2026-10-19",
})
