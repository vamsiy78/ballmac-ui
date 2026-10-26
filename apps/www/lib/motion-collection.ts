import { isMotionBlock } from "@/lib/blocks-filter"

/** The six scenes that open the "3D and motion" strip, in the order a visitor should meet them. Only the ones that exist in this build are shown. */
const PICKS = ["hero-pro-21", "hero-pro-22", "hero-pro-30", "cta-pro-5", "hero-pro-34", "hero-pro-27"] as const

/** The blocks in the collection, and the picks for its strip. The strip needs at least three picks; a build without Pro shows none. */
export function motionCollection<T extends { name: string; tags?: readonly string[] }>(blocks: readonly T[]) {
  const all = blocks.filter((b) => isMotionBlock(b.tags))
  const picks = PICKS.flatMap((n) => all.filter((b) => b.name === n))
  return { all, picks: picks.length >= 3 ? picks : [] }
}
