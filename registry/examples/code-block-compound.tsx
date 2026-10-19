"use client"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
  useHighlightedCode,
} from "@/components/ballmac/code-block"
import { Terminal } from "lucide-react"

const output = `$ pnpm build
 ✓ Compiled in 4.2s
 ✓ Generated 48 static pages
Done in 11.8s`

/** The shadcn Code Block API: header, title, actions, content. */
export default function CodeBlockCompound() {
  return (
    <CodeBlock className="max-w-xl">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <Terminal aria-hidden="true" />
          Terminal
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={output} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>{output}</CodeBlockContent>
    </CodeBlock>
  )
}
