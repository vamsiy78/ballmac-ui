// Ballmac UI: Muse sample data. https://ui.ballmac.com/templates/template-muse
import type { ModelOption } from "@/components/ballmac/model-picker"

export const models: ModelOption[] = [
  { id: "muse-5", name: "Muse 5", provider: "Muse", description: "The most capable model. Best for long, careful work.", capabilities: ["vision", "reasoning", "tools"], contextWindow: 500000, cost: 3, isNew: true },
  { id: "muse-5-fast", name: "Muse 5 Fast", provider: "Muse", description: "Quick answers for everyday questions.", capabilities: ["vision", "tools"], contextWindow: 200000, cost: 1 },
  { id: "muse-4-writer", name: "Muse 4 Writer", provider: "Muse", description: "Tuned for drafting, editing and tone.", capabilities: ["reasoning"], contextWindow: 200000, cost: 2 },
]

export type MuseChatItem = { id: string; title: string; group: "Today" | "Yesterday" | "Previous 7 days"; project?: string }

export const history: MuseChatItem[] = [
  { id: "c1", title: "Q4 plan for the design team", group: "Today", project: "Design team" },
  { id: "c2", title: "Rename the onboarding emails", group: "Today" },
  { id: "c3", title: "Explain index funds like I’m ten", group: "Yesterday" },
  { id: "c4", title: "Recipe: weeknight miso aubergine", group: "Yesterday" },
  { id: "c5", title: "Review my cover letter", group: "Previous 7 days" },
  { id: "c6", title: "Trip to Lisbon in March", group: "Previous 7 days", project: "Travel" },
  { id: "c7", title: "SQL: cohort retention query", group: "Previous 7 days", project: "Analytics" },
]

export type MuseProject = { id: string; name: string; description: string; tone: number; chats: number; files: { name: string; size: string }[]; instructions: string }

export const projects: MuseProject[] = [
  { id: "design", name: "Design team", description: "Roadmaps, critique notes and the weekly update.", tone: 1, chats: 14, files: [{ name: "Q3 retro.md", size: "12 KB" }, { name: "Brand guidelines.pdf", size: "2.1 MB" }, { name: "Research summary.docx", size: "88 KB" }], instructions: "Write in plain, warm language. Keep updates under 200 words. Always end with the next step and who owns it." },
  { id: "travel", name: "Travel", description: "Itineraries, bookings and packing lists.", tone: 2, chats: 6, files: [{ name: "Lisbon.pdf", size: "640 KB" }, { name: "Packing list.md", size: "3 KB" }], instructions: "Prefer walkable neighbourhoods and small restaurants. Give times in 24-hour format." },
  { id: "analytics", name: "Analytics", description: "SQL, dashboards and metric definitions.", tone: 3, chats: 22, files: [{ name: "Schema.sql", size: "34 KB" }, { name: "Metric glossary.md", size: "9 KB" }, { name: "Cohorts.csv", size: "1.4 MB" }, { name: "Notes.txt", size: "2 KB" }], instructions: "Use Postgres syntax. Explain each query in two sentences before showing it." },
  { id: "writing", name: "Writing", description: "Essays, drafts and edits in progress.", tone: 4, chats: 9, files: [{ name: "Essay draft.md", size: "28 KB" }], instructions: "Be a candid editor. Point out the weakest paragraph first." },
]

export type MuseArtifact = { id: string; title: string; kind: "Document" | "Code" | "Data"; updated: string; lines: string[]; body: string; filename: string; language: string }

export const artifacts: MuseArtifact[] = [
  { id: "a1", title: "Q4 design plan", kind: "Document", updated: "Today", lines: ["Goals", "Three bets", "Risks and owners"], filename: "q4-design-plan.md", language: "text", body: "# Q4 design plan\n\n## Goals\n- Ship the new onboarding flow by Oct 31\n- Cut design-to-dev handoff time in half\n- Run two customer research rounds\n\n## Three bets\n1. Onboarding rebuild\n2. Component library v2\n3. Research ops\n\n## Risks and owners\n- Scope creep on onboarding (Priya)\n- Engineering capacity in November (Dev)" },
  { id: "a2", title: "Cohort retention query", kind: "Code", updated: "3 days ago", lines: ["WITH cohorts AS (", "  SELECT user_id", "  FROM signups"], filename: "retention.sql", language: "text", body: "WITH cohorts AS (\n  SELECT user_id, date_trunc('week', created_at) AS cohort\n  FROM signups\n)\nSELECT cohort,\n       count(*) AS users,\n       count(*) FILTER (WHERE active_week_4) AS retained\nFROM cohorts\nJOIN activity USING (user_id)\nGROUP BY 1\nORDER BY 1;" },
  { id: "a3", title: "Lisbon itinerary", kind: "Document", updated: "Last week", lines: ["Day 1: Alfama", "Day 2: Belém", "Day 3: Sintra"], filename: "lisbon.md", language: "text", body: "# Lisbon, 4 days\n\n**Day 1** Alfama by foot, lunch at Taberna da Rua das Flores.\n**Day 2** Belém, pastéis, the Tower.\n**Day 3** Sintra by train, back by 18:00.\n**Day 4** Slow morning, LX Factory." },
  { id: "a4", title: "Onboarding email copy", kind: "Document", updated: "Last week", lines: ["Subject: Welcome to Fieldnote", "Hi {{name}},", "Here is how to start"], filename: "emails.md", language: "text", body: "Subject: Welcome to Fieldnote\n\nHi {{name}},\n\nThanks for joining. Here is the one thing to do first: write your first note." },
  { id: "a5", title: "Weekly metrics", kind: "Data", updated: "2 weeks ago", lines: ["week,signups,active", "36,412,288", "37,447,301"], filename: "metrics.csv", language: "text", body: "week,signups,active\n36,412,288\n37,447,301\n38,501,336\n39,478,342" },
  { id: "a6", title: "Debounce hook", kind: "Code", updated: "2 weeks ago", lines: ["export function useDebounce<T>(", "  value: T, delay = 300", ") {"], filename: "use-debounce.ts", language: "typescript", body: "export function useDebounce<T>(value: T, delay = 300) {\n  const [debounced, setDebounced] = useState(value)\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay)\n    return () => clearTimeout(id)\n  }, [value, delay])\n  return debounced\n}" },
]

export const memories = [
  "Works on the design team at Fieldnote Goods",
  "Prefers short answers with one clear next step",
  "Based in Portland, writes in US English",
  "Vegetarian; cooks on weeknights",
  "Planning a trip to Lisbon in March",
]

export const suggestions = [
  { label: "Plan my week", prompt: "Help me plan my week. I have three deadlines and a trip on Friday.", description: "Turn a messy to-do list into a calm schedule" },
  { label: "Explain something", prompt: "Explain how index funds work, like I’m ten.", description: "A clear answer with no jargon" },
  { label: "Draft an email", prompt: "Draft a kind but firm email asking a client to pay an overdue invoice.", description: "Tone, structure and a subject line" },
  { label: "Review my writing", prompt: "Be a candid editor: tell me what is weak in my opening paragraph.", description: "Honest feedback, weakest part first" },
]

/** Scripted replies, cycled so a demo conversation always has something sensible to say. */
export const replies = [
  "Here is a calm way to think about it. Start with what is fixed, such as meetings and the Friday trip, then place the deadlines in the gaps with the hardest one first, while your energy is highest.\n\nI would put the biggest deadline on Tuesday morning, leave Thursday light for surprises, and finish anything that can’t slip by Wednesday night. Want me to turn this into a day-by-day list?",
  "Good question. The short version: an index fund is a basket that owns a tiny slice of hundreds of companies, so you are not betting on any single one.\n\nWhen the companies in the basket do well, so does your slice. Because nobody is picking winners, the fees are very low, which is most of why they work.",
  "Of course. Here is a version that stays warm while being clear about the date:\n\nSubject: Quick reminder about invoice 1042\n\nHi Sam, I hope the project is going well. A note that invoice 1042 was due on the 15th. Could you let me know when to expect payment? Happy to resend it if that helps.",
]
