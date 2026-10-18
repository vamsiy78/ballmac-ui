import "server-only"

import { fetchStars } from "./github-stars"

let once: Promise<number | null> | undefined

/** The count at build time: the number the page ships with before the browser brings it up to date. Null when GitHub is unreachable. */
export const starsAtBuild = () => (once ??= fetchStars(fetch, process.env.GITHUB_TOKEN))
