import { render, screen } from "@testing-library/react"
import { encode } from "uqr"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { makeMatrix, QRCode, qrToSvg } from "@/components/ballmac/qr-code"

/** How many dark modules a path draws, counting runs: each `h` in a square path is one run, so this reads the data back. */
const darkModules = (path: string) => [...path.matchAll(/h(\d+)v1/g)].reduce((n, m) => n + Number(m[1]), 0)

describe("QRCode", () => {
  it("is an image named after what it holds", () => {
    render(<QRCode value="https://ui.ballmac.com" />)
    const svg = screen.getByRole("img", { name: "QR code for https://ui.ballmac.com" })
    expect(svg.tagName.toLowerCase()).toBe("svg")
    expect(svg.querySelector("title")).toHaveTextContent("QR code for https://ui.ballmac.com")
  })

  it("lets you name it, and shortens a long value in the name", () => {
    const { rerender } = render(<QRCode value="x" label="Join the guest Wi-Fi" />)
    expect(screen.getByRole("img", { name: "Join the guest Wi-Fi" })).toBeInTheDocument()
    rerender(<QRCode value={"a".repeat(200)} />)
    expect(screen.getByRole("img").getAttribute("aria-label")!.length).toBeLessThan(110)
  })

  it("draws exactly the modules the encoder made", () => {
    const value = "hello"
    const expected = encode(value, { ecc: "M", border: 0 })
    render(<QRCode value={value} />)
    const svg = screen.getByRole("img")
    const [, , w] = svg.getAttribute("viewBox")!.split(" ").map(Number)
    expect(w).toBe(expected.size + 8)
    // a square code is one path, with the corner markers among the rest
    const paths = svg.querySelectorAll("g > path")
    expect(paths).toHaveLength(1)
    expect(darkModules(paths[0]!.getAttribute("d")!)).toBe(expected.data.flat().filter(Boolean).length)
  })

  it("keeps the same quiet zone on every side, and a size", () => {
    render(<QRCode value="x" quietZone={2} size={120} />)
    const svg = screen.getByRole("img")
    const size = encode("x", { ecc: "M", border: 0 }).size
    expect(svg.getAttribute("viewBox")).toBe(`0 0 ${size + 4} ${size + 4}`)
    expect(svg).toHaveAttribute("width", "120")
    expect(svg.querySelector("g")).toHaveAttribute("transform", "translate(2 2)")
  })

  it("stays dark on light, whatever the page theme", () => {
    render(<QRCode value="x" />)
    const svg = screen.getByRole("img")
    expect(svg.querySelector("rect")).toHaveAttribute("fill", "rgb(255, 255, 255)")
    expect(svg.querySelector("g")).toHaveAttribute("fill", "rgb(0, 0, 0)")
  })

  it("draws rounded and dotted codes with the corner markers whole", () => {
    const { rerender } = render(<QRCode value="https://ui.ballmac.com" shape="rounded" />)
    let paths = screen.getByRole("img").querySelectorAll("g > path")
    expect(paths).toHaveLength(2)
    expect(paths[0]!.getAttribute("d")).toContain("A")
    expect(paths[1]).toHaveAttribute("fill-rule", "evenodd")
    rerender(<QRCode value="https://ui.ballmac.com" shape="dots" />)
    paths = screen.getByRole("img").querySelectorAll("g > path")
    expect(paths[0]!.getAttribute("d")).toContain("a0.44 0.44")
    expect(screen.getByRole("img").closest("[data-slot=qr-code]")).toHaveAttribute("data-shape", "dots")
  })

  it("clears the middle for a logo, and raises the error correction", () => {
    const plain = render(<QRCode value="https://ui.ballmac.com" />)
    const before = darkModules(screen.getByRole("img").querySelectorAll("g > path")[0]!.getAttribute("d")!)
    plain.unmount()
    render(<QRCode value="https://ui.ballmac.com" logo={<span>B</span>} />)
    expect(screen.getByText("B")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=qr-code-logo]")).toBeInTheDocument()
    // a higher level makes a denser code, but the middle is empty, so compare against the same level without a logo
    const after = darkModules(screen.getByRole("img").querySelectorAll("g > path")[0]!.getAttribute("d")!)
    const q = encode("https://ui.ballmac.com", { ecc: "Q", border: 0 }).data.flat().filter(Boolean).length
    expect(after).toBeLessThan(q)
    expect(before).toBeGreaterThan(0)
  })

  it("says when there is nothing to encode", () => {
    render(<QRCode value="" size={150} />)
    expect(screen.getByText("Nothing to encode yet")).toBeInTheDocument()
    expect(screen.queryByRole("img")).toBeNull()
  })

  it("says when the text is too long, and reports the error", () => {
    const onError = vi.fn()
    render(<QRCode value={"x".repeat(4000)} onError={onError} />)
    expect(screen.getByRole("alert")).toHaveTextContent("This is too long to fit in a QR code. Use a shorter link.")
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })

  it("hands over the svg element for downloads", () => {
    const ref = React.createRef<SVGSVGElement>()
    render(<QRCode value="x" svgRef={ref} />)
    expect(ref.current).toBe(screen.getByRole("img"))
  })
})

describe("makeMatrix and qrToSvg", () => {
  it("makes a square matrix with the corner markers in place", () => {
    const r = makeMatrix("test", "L")
    if (!("matrix" in r)) throw r.error
    const { data, size } = r.matrix
    expect(data).toHaveLength(size)
    // the top-left marker: a dark ring, a light ring, a dark centre
    expect(data[0]!.slice(0, 7).every(Boolean)).toBe(true)
    expect(data[1]![1]).toBe(false)
    expect(data[3]![3]).toBe(true)
    expect(data[0]!.slice(size - 7).every(Boolean)).toBe(true)
  })
  it("reports text that does not fit", () => {
    expect("error" in makeMatrix("y".repeat(5000), "H")).toBe(true)
  })
  it("writes a standalone SVG file", () => {
    const svg = qrToSvg("hello", { size: 256 })
    expect(svg.startsWith("<svg xmlns=")).toBe(true)
    expect(svg).toContain('width="256"')
    expect(svg).toContain('fill="rgb(0, 0, 0)"')
    expect(() => qrToSvg("z".repeat(5000))).toThrow()
  })
})
