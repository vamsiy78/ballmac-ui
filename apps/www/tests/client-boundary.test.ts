import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { boundaryProblems } from "../../../scripts/check-client-boundary"
import type { LoadedItem } from "../../../scripts/lib"

/** Items whose files live in a temp folder, with install paths like the real registry. */
function items(files: Record<string, string>): LoadedItem[] {
  const dir = mkdtempSync(join(tmpdir(), "boundary-"))
  mkdirSync(join(dir, "components"), { recursive: true })
  mkdirSync(join(dir, "lib"), { recursive: true })
  for (const [path, code] of Object.entries(files)) writeFileSync(join(dir, path), code)
  return Object.keys(files).map((path) => ({ name: path.replace(/^\w+\/|\.tsx?$/g, ""), files: [{ path }], baseDir: dir }) as unknown as LoadedItem)
}

const CLIENT = `"use client"\nexport function Media() { return null }\nexport function isMediaImage(v: unknown) { return typeof v === "string" }\nexport type MediaImage = { src: string }\n`

describe("client boundary", () => {
  it("catches a server file calling a function exported from a client file (the isMediaImage crash)", () => {
    const found = boundaryProblems(
      items({
        "components/media.tsx": CLIENT,
        "components/bento-grid.tsx": `import { Media, isMediaImage } from "@/components/ballmac/media"\nexport const BentoGrid = () => (isMediaImage("x") ? <Media /> : null)\n`,
      })
    )
    expect(found).toHaveLength(1)
    expect(found[0]).toMatch(/bento-grid: components\/bento-grid\.tsx is a server file but imports isMediaImage from the client file @\/components\/ballmac\/media/)
  })

  it("allows components and types, which pass through the boundary", () => {
    expect(
      boundaryProblems(
        items({
          "components/media.tsx": CLIENT,
          "components/card.tsx": `import { Media, type MediaImage } from "@/components/ballmac/media"\nimport type { MediaImage as Img } from "@/components/ballmac/media"\nexport const Card = (p: { m: MediaImage }) => <Media />\n`,
        })
      )
    ).toEqual([])
  })

  it("allows a client file to import anything from another client file", () => {
    expect(
      boundaryProblems(
        items({
          "components/media.tsx": CLIENT,
          "components/hero.tsx": `"use client"\nimport { isMediaImage } from "@/components/ballmac/media"\nexport const Hero = () => isMediaImage("x")\n`,
        })
      )
    ).toEqual([])
  })

  it("allows a server file to use a helper that lives in a plain module", () => {
    expect(
      boundaryProblems(
        items({
          "lib/media-image.ts": `export function isMediaImage(v: unknown) { return typeof v === "string" }\n`,
          "components/bento-grid.tsx": `import { isMediaImage } from "@/lib/ballmac/media-image"\nexport const B = () => isMediaImage("x")\n`,
        })
      )
    ).toEqual([])
  })

  it("sees a client directive after a header comment", () => {
    expect(
      boundaryProblems(
        items({
          "components/media.tsx": `// Ballmac UI: Media.\n"use client"\nexport function isMediaImage() { return true }\n`,
          "components/b.tsx": `import { isMediaImage } from "@/components/ballmac/media"\nexport const B = () => isMediaImage()\n`,
        })
      )
    ).toHaveLength(1)
  })
})
