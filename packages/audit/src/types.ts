export type Severity = "error" | "warn" | "info"
export type RuleLevel = Severity | "off"
export type Area = "states" | "a11y" | "tokens" | "motion" | "layout" | "rtl"

/** What a rule is, written for the person or agent who has to act on it. */
export type RuleMeta = {
  id: string
  area: Area
  title: string
  /** Why it matters to a user of the finished app. */
  why: string
  /** What to do about it. */
  fix: string
  defaultLevel: RuleLevel
  /** A bad and a good example, for agents that read the rules before writing code. */
  example?: { bad: string; good: string }
}

export type Finding = {
  rule: string
  severity: Severity
  /** Path relative to the audited folder, with forward slashes. */
  file: string
  line: number
  column: number
  message: string
  fix: string
  /** The offending line, trimmed. */
  snippet?: string
}

/** What the audit may know about a Ballmac item, from the registry's versions.json. */
export type CatalogItem = { exports?: string[]; states?: string[] }
export type Catalog = Record<string, CatalogItem>

export type Config = {
  rules: Record<string, RuleLevel>
  /** Extra folders or files to leave out, relative to the audited folder. Plain names or simple `*` globs. */
  ignore: string[]
  /** Check physical-direction classes (ml-, pr-, text-left). Off unless the app supports right-to-left. */
  rtl: boolean
}

export type AuditOptions = {
  /** The project folder. */
  root: string
  /** Limit the audit to these files or folders (relative to `root`). */
  paths?: string[]
  catalog?: Catalog
  config?: Partial<Config>
  /** Also audit components/ui and components/ballmac, which are library code. Off by default. */
  includeLibrary?: boolean
  maxFiles?: number
  maxFileBytes?: number
}

export type Report = {
  root: string
  filesScanned: number
  /** Files that were looked at with the syntax-aware rules. Zero means TypeScript could not be found. */
  filesParsed: number
  findings: Finding[]
  counts: Record<Severity, number>
  byRule: Record<string, number>
  /** Things the audit could not do, said plainly (no TypeScript, a missing catalogue, files skipped). */
  notes: string[]
  /** Rules that ran. */
  rules: string[]
}
