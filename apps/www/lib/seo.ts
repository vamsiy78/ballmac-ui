// Search results cut titles at about 60 characters and descriptions at about 160. These keep ours whole and readable.

const SUFFIX = " | Ballmac UI" // added by the root layout's title template

/** A description of at most `max` characters: whole sentences when they fit, otherwise cut at a word with an ellipsis. */
export function seoDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "))
  if (sentence >= 80) return cut.slice(0, sentence + 1)
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s-]+$/, "")}…`
}

/** The page title (the layout adds " | Ballmac UI"): the descriptive form when it fits, else the bare name, else the name cut at a word. */
export function seoTitle(name: string, descriptive?: string, max = 70 - SUFFIX.length): string {
  if (descriptive && descriptive.length <= max) return descriptive
  if (name.length <= max) return name
  const cut = name.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s-]+$/, "")}…`
}
