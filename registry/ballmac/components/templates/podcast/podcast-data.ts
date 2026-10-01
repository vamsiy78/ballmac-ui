// Ballmac UI: Podcast sample content. https://ui.ballmac.com/templates/template-podcast

export type TranscriptLine = { t: number; who: string; text: string }
export type Episode = {
  n: number
  slug: string
  title: string
  guest: string
  guestRole: string
  date: string
  /** Length in seconds. */
  duration: number
  season: 1 | 2 | 3
  summary: string
  art: number
  chapters: { start: number; title: string }[]
}

export const episodes: Episode[] = [
  { n: 42, slug: "the-optimised-life", title: "The Optimised Life", guest: "Amara Okafor", guestRole: "Writer and technologist", date: "2026-09-29", duration: 2460, season: 3, summary: "A year without metrics, and what was left when she stopped counting. Plus: why the best dinner party has no agenda.", art: 0, chapters: [{ start: 0, title: "Cold open" }, { start: 95, title: "Why we stopped measuring" }, { start: 612, title: "The spreadsheet that ate a year" }, { start: 1480, title: "What replaced it" }, { start: 2210, title: "Listener questions" }] },
  { n: 41, slug: "bread-and-patience", title: "Bread and Patience", guest: "Tomás Reyes", guestRole: "Baker", date: "2026-09-15", duration: 2920, season: 3, summary: "A third-generation baker on sourdough, sleep and why nothing good happens quickly.", art: 1, chapters: [{ start: 0, title: "Welcome" }, { start: 300, title: "The starter" }, { start: 1500, title: "Night shifts" }] },
  { n: 40, slug: "the-unfinished-city", title: "The Unfinished City", guest: "Inês Marques", guestRole: "Editor", date: "2026-09-01", duration: 2210, season: 3, summary: "Scaffolding, cranes and the case for cities that are never done.", art: 2, chapters: [{ start: 0, title: "Welcome" }, { start: 410, title: "Rua da Madalena" }] },
  { n: 39, slug: "what-the-radio-knew", title: "What the Radio Knew", guest: "Elena Rossi", guestRole: "Culture editor", date: "2026-08-18", duration: 1980, season: 3, summary: "Why the old shipping forecast still feels like poetry.", art: 3, chapters: [{ start: 0, title: "Welcome" }, { start: 600, title: "The forecast" }] },
  { n: 38, slug: "a-year-offline", title: "A Year Offline", guest: "Dev Patel", guestRole: "Engineer", date: "2026-08-04", duration: 3120, season: 3, summary: "He deleted every feed and kept the group chats. Here is what changed.", art: 4, chapters: [{ start: 0, title: "Welcome" }, { start: 800, title: "Week three" }] },
  { n: 37, slug: "small-kitchens", title: "Small Kitchens", guest: "Mei Tanaka", guestRole: "Chef", date: "2026-07-21", duration: 2640, season: 2, summary: "Cooking for twelve on two burners, and why constraints taste good.", art: 5, chapters: [{ start: 0, title: "Welcome" }, { start: 520, title: "Two burners" }] },
  { n: 36, slug: "the-long-way-home", title: "The Long Way Home", guest: "Sasha Petrova", guestRole: "Travel writer", date: "2026-07-07", duration: 2750, season: 2, summary: "Trains, ferries and the pleasure of arriving slowly.", art: 0, chapters: [{ start: 0, title: "Welcome" }] },
  { n: 35, slug: "on-listening", title: "On Listening", guest: "Marcus Lindqvist", guestRole: "Therapist", date: "2026-06-23", duration: 2300, season: 2, summary: "What a good listener actually does, and how to become one.", art: 2, chapters: [{ start: 0, title: "Welcome" }] },
]

export const transcript: TranscriptLine[] = [
  { t: 0, who: "Nora", text: "Welcome to The Long Table, the show where we sit down for a long dinner and talk about whatever comes up." },
  { t: 14, who: "Sam", text: "Tonight it's Amara Okafor, who spent a year without measuring anything. No steps, no calories, no inbox zero." },
  { t: 31, who: "Nora", text: "Which sounds either wonderful or like a recipe for disaster." },
  { t: 40, who: "Amara", text: "Both, honestly. The first month I felt like I'd lost my map. I kept reaching for numbers the way you reach for a phone you've left in another room." },
  { t: 63, who: "Sam", text: "What were you actually measuring before? Walk us through a normal day." },
  { t: 76, who: "Amara", text: "Everything. Sleep, steps, tasks closed, words written, minutes meditated. I had a dashboard for my own life and it had a streak counter." },
  { t: 99, who: "Nora", text: "A streak counter for meditating. That's the part that gets me." },
  { t: 108, who: "Amara", text: "I know. I once meditated in a taxi to keep a streak alive. I wasn't calm. I was anxious about the streak." },
  { t: 126, who: "Sam", text: "So what made you stop?" },
  { t: 132, who: "Amara", text: "A very ordinary Tuesday. I realised I couldn't remember anything about the week except the numbers." },
]

export const getEpisode = (slug: string) => episodes.find((e) => e.slug === slug) ?? episodes[0]
const fmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
export const formatDate = (iso: string) => fmt.format(new Date(iso))
export const minutes = (s: number) => `${Math.round(s / 60)} min`
