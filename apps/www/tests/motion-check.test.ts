import { describe, expect, it } from "vitest"

import { motionProblems } from "../../../scripts/check-motion"

const loop = "transition={{ duration: 2, repeat: Infinity }}"

describe("motion guard", () => {
  it("accepts a loop that listens to the theme", () => {
    expect(motionProblems({ "a.tsx": `const still = useLoopsPaused()\n${loop}` }, {})).toEqual([])
    expect(motionProblems({ "a.tsx": "animation: x 2s infinite; animation-play-state: var(--bm-ambient-state, running)" }, {})).toEqual([])
  })
  it("rejects a loop that ignores it", () => {
    expect(motionProblems({ "a.tsx": loop }, {})[0]).toContain("ignores the theme")
    expect(motionProblems({ "a.tsx": "animation: x 2s ease infinite" }, {})).toHaveLength(1)
  })
  it("accepts a listed functional loop", () => {
    expect(motionProblems({ "a.tsx": loop }, { "a.tsx": "status indicator" })).toEqual([])
  })
  it("keeps the list honest", () => {
    expect(motionProblems({ "a.tsx": "no loops here" }, { "a.tsx": "x" })[0]).toContain("no endless loop")
    expect(motionProblems({ "a.tsx": `useLoopsPaused()\n${loop}` }, { "a.tsx": "x" })[0]).toContain("now listens")
    expect(motionProblems({}, { "gone.tsx": "x" })[0]).toContain("does not exist")
  })
  it("does not mind files without loops", () => {
    expect(motionProblems({ "a.tsx": "export const x = 1" }, {})).toEqual([])
  })
})
