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

const command = "npx ballmac add code-block"

/** Without a header, actions float at the top end and show on hover, focus and touch. */
export default function CodeBlockFloating() {
  return (
    <CodeBlock className="max-w-xl">
      <CodeBlockActions>
        <CodeBlockCopyButton value={command} />
      </CodeBlockActions>
      <CodeBlockContent>{command}</CodeBlockContent>
    </CodeBlock>
  )
}
