/**
 * State discipline: every free block says what it can show, so agents and buyers are never left guessing.
 *
 * A free block must either
 *   - list its `states` (loading, empty, error, submitting, success, ...), each pointing at an example that shows it, or
 *   - say `statesNone` with the reason it has nothing to load, submit or fail.
 * An example that a state points at must be a client component when it passes functions as props (`onRetry={() => {}}`):
 * a server component cannot hand functions to a client component, and the production build fails.
 * Pro blocks are reported but not yet required.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { loadItems, type LoadedItem } from "./lib"

const PASSES_FUNCTION = /=\{\s*(async\s*)?\(|=\{\s*(async\s*)?[A-Za-z_]+\s*=>/

export function stateProblems(items: LoadedItem[], read: (item: LoadedItem, file: string) => string) {
  const problems: string[] = []
  for (const item of items) {
    if (item.category === "blocks" && item.tier === "free" && !item.states.length && !item.statesNone) {
      problems.push(`${item.name}: lists no states and gives no statesNone. List its states (each with an example), or say why it has none.`)
    }
    for (const state of item.states) {
      const example = item.examples.find((e) => e.name === state.example)
      if (!example) continue
      const source = read(item, example.file)
      if (PASSES_FUNCTION.test(source) && !/^\s*["']use client["']/.test(source)) {
        problems.push(`${item.name}: the ${state.id} example (${example.file}) passes a function as a prop but is not a client component. Add "use client" at the top.`)
      }
    }
  }
  return problems
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const items = await loadItems()
  const problems = stateProblems(items, (item, file) => readFileSync(join(item.examplesDir, file), "utf8"))
  if (problems.length) {
    console.error(`✗ States check failed:\n  - ${problems.join("\n  - ")}`)
    process.exit(1)
  }
  const blocks = items.filter((i) => i.category === "blocks")
  const free = blocks.filter((b) => b.tier === "free")
  const withStates = free.filter((b) => b.states.length).length
  const pro = blocks.filter((b) => b.tier === "pro")
  const proDeclared = pro.filter((b) => b.states.length || b.statesNone).length
  console.log(`✓ States: ${free.length} free block(s): ${withStates} with states, ${free.length - withStates} static${pro.length ? `; Pro: ${proDeclared} of ${pro.length} declared` : ""}`)
}
