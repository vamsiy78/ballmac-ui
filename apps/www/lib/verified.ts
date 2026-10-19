import "server-only"

import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import ballmac from "@/content/verified/ballmac.json"

import { invalidScorecard, rank, toRow, type Row, type Scorecard } from "./verified-core"

const DIR = join(process.cwd(), "content/verified/submissions")

/** Ballmac's own scorecard, written by `pnpm verified:generate`. */
export const own = ballmac as unknown as Scorecard

/** Scorecards other registries have submitted. Each has been checked by the tests, so a malformed one never reaches the page. */
export function submissions(): Scorecard[] {
  try {
    return readdirSync(DIR)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")) as Scorecard)
      .filter((c) => !invalidScorecard(c))
  } catch {
    return []
  }
}

export function leaderboard(): Row[] {
  return rank([toRow(own, true), ...submissions().map((c) => toRow(c))])
}
