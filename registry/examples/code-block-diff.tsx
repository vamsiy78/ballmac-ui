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

const lines = [
  { text: "export function total(items: Item[]) {", variant: "default" },
  { text: "  return items.reduce((sum, i) => sum + i.price, 0)", variant: "removed" },
  { text: "  return items.reduce((sum, i) => sum + i.price * i.qty, 0)", variant: "added" },
  { text: "}", variant: "default" },
] as const

/** Added and removed lines carry a + or − marker as well as a tint, so color is not the only cue. */
export default function CodeBlockDiff() {
  return (
    <CodeBlock className="max-w-xl">
      <CodeBlockHeader>
        <CodeBlockTitle>lib/cart.ts</CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent>
        {lines.map((line, index) => (
          <CodeBlockLine key={index} variant={line.variant}>
            {line.text}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}
