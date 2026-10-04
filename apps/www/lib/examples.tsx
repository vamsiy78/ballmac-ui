import { freeExampleNames } from "@/lib/generated/example-names"
import { examples as proExamples } from "@/lib/generated/examples"
import { ExampleRenderer } from "@/lib/generated/examples-client"
import { LazyExample } from "@/components/site/lazy-example"

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

/**
 * A thumbnail for a gallery tile: like `loadExample`, but the example's code is only fetched when the tile mounts.
 * Pro examples return null: galleries show them in an iframe of `/preview/<name>` (see `PageThumb`'s `frame`), so their markup stays out of the page.
 */
export async function loadThumb(name: string) {
  if (!freeExampleNames.has(name)) return null
  function Thumb() {
    return <LazyExample name={name} />
  }
  Thumb.displayName = `Thumb(${name})`
  return Thumb
}
