import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
  useHighlightedCode,
} from "@/components/ballmac/code-block"

describe("CodeBlock", () => {
  it("copies the plain code", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    render(<CodeBlock filename="a.ts" code={"const a = 1\nconst b = 2"} />)
    await user.click(screen.getByRole("button", { name: /copy/i }))
    expect(writeText).toHaveBeenCalledWith("const a = 1\nconst b = 2")
  })
})

describe("CodeBlock compound API", () => {
  it("renders the parts and copies the value", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    render(
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>Terminal</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value="pnpm build" />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>pnpm build</CodeBlockContent>
      </CodeBlock>
    )
    expect(screen.getByText("Terminal")).toBeInTheDocument()
    const content = document.querySelector("[data-slot=code-block-content]")!
    expect(content).toHaveAttribute("dir", "ltr")
    expect(content).toHaveAttribute("tabindex", "0")
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(writeText).toHaveBeenCalledWith("pnpm build")
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument()
  })

  it("splits a string into numbered lines starting where asked", () => {
    render(
      <CodeBlock>
        <CodeBlockContent lineNumbers startLine={10}>
          {"a\nb\n"}
        </CodeBlockContent>
      </CodeBlock>
    )
    expect(document.querySelectorAll("[data-slot=code-block-line]")).toHaveLength(2)
    expect(document.querySelector("[data-slot=code-block-content]")).toHaveStyle({ counterReset: "line 9" })
  })

  it("keeps blank lines so a copied selection does too", () => {
    render(
      <CodeBlock>
        <CodeBlockContent>
          <CodeBlockLine />
        </CodeBlockContent>
      </CodeBlock>
    )
    expect(document.querySelector("[data-slot=code-block-line-content]")?.textContent).toBe("\n")
  })

  it("marks the variant on lines and on the block", () => {
    render(
      <CodeBlock size="sm" variant="destructive">
        <CodeBlockContent>
          <CodeBlockLine variant="added">x</CodeBlockLine>
        </CodeBlockContent>
      </CodeBlock>
    )
    expect(document.querySelector("[data-slot=code-block]")).toHaveAttribute("data-variant", "destructive")
    expect(document.querySelector("[data-slot=code-block]")).toHaveAttribute("data-size", "sm")
    expect(document.querySelector("[data-slot=code-block-line]")).toHaveAttribute("data-variant", "added")
  })

  it("highlights into one node per line", () => {
    function Probe() {
      const lines = useHighlightedCode('const a = "x"\nreturn a', "ts")
      return <p data-testid="n">{lines.length}</p>
    }
    render(<Probe />)
    expect(screen.getByTestId("n")).toHaveTextContent("2")
  })

  it("still renders the ready-made panel when no parts are inside", () => {
    render(<CodeBlock filename="a.ts" code="x" />)
    expect(document.querySelector("[data-slot=code-block-body]")).toBeInTheDocument()
  })
})
