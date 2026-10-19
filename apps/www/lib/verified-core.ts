/** The shape of a `ballmac verify` scorecard, and what a leaderboard row is made from one. Pure, so tests and the page share it. */
export type Grade = "A" | "B" | "C" | "D" | "F"
export type ScorecardCheck = { id: string; label: string; what: string; weight: number; pass: number; fail: number; na: number; pct: number }
export type Scorecard = {
  schema: 1
  tool: string
  registry: { name: string; homepage?: string; source: string }
  generated: string
  items: { total: number; scored: number }
  score: number
  grade: Grade
  checks: ScorecardCheck[]
  weakest: { name: string; type: string; score: number; problems: string[] }[]
  notes: string[]
}

export type Row = { name: string; homepage?: string; score: number; grade: Grade; scored: number; generated: string; source: string; own: boolean }

const GRADES = new Set(["A", "B", "C", "D", "F"])
const gradeOf = (score: number): Grade => (score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F")

/** Why a scorecard cannot be listed, or undefined when it can. A listed card must be one `ballmac verify` could have written. */
export function invalidScorecard(x: unknown): string | undefined {
  const c = x as Partial<Scorecard> | null
  if (!c || typeof c !== "object") return "not an object"
  if (c.schema !== 1) return "schema must be 1"
  if (typeof c.registry?.name !== "string" || !c.registry.name.trim()) return "registry.name is missing"
  if (typeof c.registry.source !== "string" || !/^https:\/\//.test(c.registry.source)) return "registry.source must be a public https address anyone can run verify on"
  if (typeof c.score !== "number" || c.score < 0 || c.score > 100 || !Number.isInteger(c.score)) return "score must be a whole number from 0 to 100"
  if (!GRADES.has(c.grade as string) || c.grade !== gradeOf(c.score)) return "grade does not match the score"
  if (!Number.isFinite(Date.parse(c.generated ?? ""))) return "generated is not a date"
  if (!c.items || !Number.isInteger(c.items.scored) || c.items.scored < 1) return "items.scored must be at least 1"
  if (!Array.isArray(c.checks) || c.checks.length === 0) return "checks are missing"
  let num = 0
  let den = 0
  for (const k of c.checks) {
    if (typeof k.weight !== "number" || !Number.isInteger(k.pass) || !Number.isInteger(k.fail)) return `check ${String(k.id)} is malformed`
    if (k.pass + k.fail === 0) continue
    num += k.weight * (k.pass / (k.pass + k.fail))
    den += k.weight
  }
  // The score is derived from the checks; a card whose numbers disagree was edited.
  if (!den || Math.round((num / den) * 100) !== c.score) return "score does not follow from the checks"
  return undefined
}

export function toRow(card: Scorecard, own = false): Row {
  return { name: card.registry.name, homepage: card.registry.homepage, score: card.score, grade: card.grade, scored: card.items.scored, generated: card.generated, source: card.registry.source, own }
}

/** Highest score first; a bigger registry ranks above a smaller one on the same score, then by name. */
export function rank(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => b.score - a.score || b.scored - a.scored || a.name.localeCompare(b.name))
}
