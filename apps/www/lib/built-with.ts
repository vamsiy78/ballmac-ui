/**
 * Projects shown on /built-with. An entry is added by hand after someone submits the "Built with Ballmac UI" issue form and we have checked that the project is
 * live and really uses the library. Nothing is shown that was not submitted: while the list is empty the page says so, is not indexed and is not linked from the footer.
 * No framework imports.
 */
export type BuiltWith = {
  /** Lower-case, used as a key. */
  slug: string
  name: string
  /** The public address, https only. */
  url: string
  /** One or two plain sentences, written by the maker. */
  description: string
  /** Ballmac UI items it uses, by name. */
  items: string[]
  /** A screenshot in /public/built-with, 1600 px wide or more. */
  image: string
  imageAlt: string
  /** ISO date it was added. */
  added: string
}

export const BUILT_WITH: BuiltWith[] = []

export const ISSUE_URL = "https://github.com/vamsiy78/ballmac-ui/issues/new?template=built-with.yml"
export const PROPOSE_URL = "https://github.com/vamsiy78/ballmac-ui/issues/new?template=propose-item.yml"
