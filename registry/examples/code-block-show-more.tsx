"use client"

import * as React from "react"

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

const code = Array.from({ length: 30 }, (_, i) => `line ${i + 1}: output from the build step`).join("\n")

/** The footer is a slot below the content; here it holds a Show more button. */
export default function CodeBlockShowMore() {
  const [expanded, setExpanded] = React.useState(false)
  const id = React.useId()
  return (
    <CodeBlock className="max-w-xl">
      <CodeBlockHeader>
        <CodeBlockTitle>build.log</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent id={id} lineNumbers className={expanded ? "max-h-96" : "max-h-40 overflow-y-hidden"}>
        {code}
      </CodeBlockContent>
      <CodeBlockFooter className="justify-center">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
          className="h-7 rounded-md px-2 text-xs text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </CodeBlockFooter>
    </CodeBlock>
  )
}
