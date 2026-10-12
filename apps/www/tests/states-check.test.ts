import { describe, expect, it } from "vitest"

import { stateProblems } from "../../../scripts/check-states"

type Item = Parameters<typeof stateProblems>[0][number]

const block = (p: Partial<Item>) => ({ name: "b-1", category: "blocks", tier: "free", states: [], statesNone: undefined, examples: [], ...p }) as unknown as Item
const state = (example: string) => ({ id: "error", title: "Error", example, trigger: 'state="error"' })

describe("states guard", () => {
  it("accepts a block that lists states or says why it has none", () => {
    expect(stateProblems([block({ states: [state("b-1-error")] as never, examples: [{ name: "b-1-error", file: "b-1-error.tsx" }] as never })], () => '"use client"\nexport default 1')).toEqual([])
    expect(stateProblems([block({ statesNone: "Static content." })], () => "")).toEqual([])
  })

  it("rejects a block that does neither, but not a component", () => {
    expect(stateProblems([block({})], () => "")[0]).toContain("lists no states")
    expect(stateProblems([block({ tier: "pro" as never })], () => "")[0]).toContain("states-pending")
    expect(stateProblems([block({ category: "primitives" as never })], () => "")).toEqual([])
  })

  it("lets a Pro block wait on the pending list, and keeps the list honest", () => {
    const pro = block({ name: "x-pro-1", tier: "pro" as never })
    expect(stateProblems([pro], () => "", { "x-pro-1": "not built yet" })).toEqual([])
    expect(stateProblems([block({ ...pro, statesNone: "Static content." })], () => "", { "x-pro-1": "not built yet" })[0]).toContain("Remove the entry")
    expect(stateProblems([], () => "", { "gone-pro-1": "x" })[0]).toContain("does not exist")
    // a free block cannot hide on the Pro list
    expect(stateProblems([block({ name: "free-1" })], () => "", { "free-1": "x" })[0]).toContain("lists no states")
  })

  it("rejects a state example that passes a function but is not a client component", () => {
    const item = block({ states: [state("b-1-error")] as never, examples: [{ name: "b-1-error", file: "b-1-error.tsx" }] as never })
    expect(stateProblems([item], () => 'export default function X() { return <B state="error" onRetry={() => {}} /> }')[0]).toContain("not a client component")
    expect(stateProblems([item], () => '"use client"\nexport default function X() { return <B state="error" onRetry={() => {}} /> }')).toEqual([])
    expect(stateProblems([item], () => 'export default function X() { return <B state="error" /> }')).toEqual([])
  })
})
