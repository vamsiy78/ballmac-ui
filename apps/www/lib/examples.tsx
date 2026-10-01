import { freeExampleNames } from "@/lib/generated/example-names"
import { examples as proExamples } from "@/lib/generated/examples"
import { ExampleRenderer } from "@/lib/generated/examples-client"

/**
 * Loads an example component by registry name (server-side).
 * Free examples render through a lazy client map (`examples-client.tsx`, one chunk per example), so a page only
 * downloads the examples it shows. Pro examples render on the server so their source never ships as a chunk.
 */
export async function loadExample(name: string) {
  if (freeExampleNames.has(name)) {
    function Example() {
      return <ExampleRenderer name={name} />
    }
    Example.displayName = `Example(${name})`
    return Example
  }
  const load = proExamples[name]
  return load ? (await load()).default : null
}
