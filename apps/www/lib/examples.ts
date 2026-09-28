import { examples } from "@/lib/generated/examples"

/** Loads an example component by registry name (server-side). */
export async function loadExample(name: string) {
  const load = examples[name]
  if (!load) return null
  return (await load()).default
}
