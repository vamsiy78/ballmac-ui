import type { MediaSource } from "@/components/ballmac/media"

// Ballmac UI: Publication sample content. https://ui.ballmac.com/templates/template-publication

export type Section = "Essays" | "Culture" | "Science" | "Technology" | "Interviews"
export const sections: Section[] = ["Essays", "Culture", "Science", "Technology", "Interviews"]

export type Author = { id: string; name: string; role: string; bio: string; tone: number }
export const authors: Author[] = [
  { id: "ines", name: "Inês Marques", role: "Senior editor", bio: "Writes about cities, memory and the objects we keep. Previously at a daily paper in Porto.", tone: 1 },
  { id: "tomas", name: "Tomás Reyes", role: "Science correspondent", bio: "Reports on ecology and the people who count things for a living.", tone: 2 },
  { id: "amara", name: "Amara Okafor", role: "Contributing writer", bio: "Essays on technology, work and the slow end of the internet.", tone: 3 },
  { id: "elena", name: "Elena Rossi", role: "Culture editor", bio: "Edits the culture desk. Cooks, reads, rarely sleeps in October.", tone: 4 },
]

export type Article = { id: string; section: Section; kicker: string; title: string; dek: string; author: string; date: string; read: number; art: number; popular?: number; image?: MediaSource; imageAlt?: string }

export const articles: Article[] = [
  { id: "a1", section: "Essays", kicker: "The long view", title: "The case for the unfinished city", dek: "What a scaffold-covered street teaches us about patience, and why the cities we love are never done.", author: "ines", date: "2026-09-28", read: 14, art: 0, popular: 1 },
  { id: "a2", section: "Science", kicker: "Field notes", title: "Counting every bird in a parish of three hundred", dek: "A volunteer census, a very cold spring, and the surprising comeback of the corn bunting.", author: "tomas", date: "2026-09-26", read: 11, art: 1, popular: 3 },
  { id: "a3", section: "Technology", kicker: "Slow tech", title: "The internet we left in the drawer", dek: "On forums, feeds and the small websites that quietly still work.", author: "amara", date: "2026-09-25", read: 9, art: 2, popular: 2 },
  { id: "a4", section: "Culture", kicker: "Table talk", title: "A defence of the weeknight dinner", dek: "Nobody photographs it. That is exactly the point.", author: "elena", date: "2026-09-24", read: 6, art: 3 },
  { id: "a5", section: "Interviews", kicker: "In conversation", title: "“I only write in the margins”", dek: "The novelist Dalia Costa on notebooks, naps and finishing nothing for eleven years.", author: "ines", date: "2026-09-22", read: 18, art: 4, popular: 4 },
  { id: "a6", section: "Essays", kicker: "On work", title: "Against the optimised life", dek: "A year without metrics, and what was left when I stopped counting.", author: "amara", date: "2026-09-20", read: 12, art: 5 },
  { id: "a7", section: "Science", kicker: "Deep time", title: "The rock that remembers the sea", dek: "A geologist reads a cliff face like a diary.", author: "tomas", date: "2026-09-18", read: 8, art: 0 },
  { id: "a8", section: "Culture", kicker: "Listening", title: "What the radio knew", dek: "Why the old weather forecast still feels like poetry.", author: "elena", date: "2026-09-15", read: 7, art: 2 },
  { id: "a9", section: "Technology", kicker: "Craft", title: "Write the manual first", dek: "How good software gets made backwards.", author: "amara", date: "2026-09-12", read: 10, art: 1 },
  { id: "a10", section: "Essays", kicker: "Small things", title: "In praise of the folding chair", dek: "The most democratic object ever designed.", author: "ines", date: "2026-09-09", read: 5, art: 3 },
]

export type Issue = { n: number; season: string; theme: string; art: number; image?: MediaSource; imageAlt?: string }

export const issues: Issue[] = [
  { n: 48, season: "Autumn 2026", theme: "Patience", art: 0 },
  { n: 47, season: "Summer 2026", theme: "Heat", art: 1 },
  { n: 46, season: "Spring 2026", theme: "Return", art: 2 },
  { n: 45, season: "Winter 2025", theme: "Quiet", art: 3 },
  { n: 44, season: "Autumn 2025", theme: "Maps", art: 4 },
  { n: 43, season: "Summer 2025", theme: "Water", art: 5 },
]

export const getAuthor = (id: string) => authors.find((a) => a.id === id) ?? authors[0]
const fmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
const fmtShort = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
export const formatDate = (iso: string) => fmt.format(new Date(iso))
export const formatShort = (iso: string) => fmtShort.format(new Date(iso))
