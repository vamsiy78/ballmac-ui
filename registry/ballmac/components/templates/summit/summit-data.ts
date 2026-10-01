// Ballmac UI: Summit template data. https://ui.ballmac.com/templates/template-summit
export type Track = "Main stage" | "Craft" | "Systems"
export const tracks: Track[] = ["Main stage", "Craft", "Systems"]

export type Speaker = { id: string; name: string; role: string; company: string; bio: string; tone: number; track: Track; talk: string }

export const speakers: Speaker[] = [
  { id: "ingrid", name: "Ingrid Solheim", role: "Design director", company: "Fjord & Co", bio: "Ingrid leads a forty-person studio that designs ferries, hospitals and the signs between them. She believes the best interface is a good sign.", tone: 0, track: "Main stage", talk: "Wayfinding for the weary" },
  { id: "kofi", name: "Kofi Mensah", role: "Principal engineer", company: "Lattice", bio: "Kofi has run the on-call rota for a payments network for eight years and has opinions about alert fatigue that he is happy to share.", tone: 1, track: "Systems", talk: "Pagers are a design problem" },
  { id: "mira", name: "Mira Castellanos", role: "Type designer", company: "Letterform Foundry", bio: "Mira draws typefaces for screens that nobody has built yet. Her latest family ships with a hundred and forty weights.", tone: 2, track: "Craft", talk: "The weight between regular and bold" },
  { id: "jun", name: "Jun Watanabe", role: "Founder", company: "Tidepool", bio: "Jun built three companies in three countries and is writing a book about the quiet years between them.", tone: 3, track: "Main stage", talk: "The quiet years" },
  { id: "amara", name: "Amara Nwosu", role: "Research lead", company: "Open Lab", bio: "Amara studies how people actually use software when nobody is watching, and what they build around it.", tone: 4, track: "Craft", talk: "What users do with your product on Sunday" },
  { id: "leo", name: "Leo Bergstrom", role: "Staff engineer", company: "Northwind", bio: "Leo ripped out a two-million-line monolith one route at a time and kept a diary of every week.", tone: 0, track: "Systems", talk: "Deleting the monolith, a diary" },
  { id: "sana", name: "Sana Iqbal", role: "Head of product", company: "Parcel", bio: "Sana ships features that remove other features. Her team once shrank the settings page by sixty percent.", tone: 2, track: "Main stage", talk: "Subtraction as a roadmap" },
  { id: "tomas", name: "Tomáš Havel", role: "Motion designer", company: "Frame Rate", bio: "Tomáš animates interfaces that feel like physical objects, and has strong views on easing curves.", tone: 1, track: "Craft", talk: "Easing is a feeling" },
  { id: "freya", name: "Freya Lindqvist", role: "Security architect", company: "Vaultline", bio: "Freya designs the unglamorous parts: key rotation, audit trails and the recovery flow nobody wants to test.", tone: 3, track: "Systems", talk: "Design for the worst day" },
  { id: "dev", name: "Dev Raman", role: "Creative technologist", company: "Studio Nine", bio: "Dev builds installations out of sensors, shaders and a worrying amount of tape.", tone: 4, track: "Craft", talk: "Making light listen" },
  { id: "elena", name: "Elena Rossi", role: "Editor in chief", company: "Margin Magazine", bio: "Elena edits a magazine about slowness, which is published, appropriately, quarterly.", tone: 2, track: "Main stage", talk: "In praise of the long read" },
  { id: "noah", name: "Noah Fischer", role: "Platform lead", company: "Relay", bio: "Noah makes developer platforms people actually enjoy, mostly by deleting steps from the docs.", tone: 0, track: "Systems", talk: "The ten-minute quickstart" },
]

export type Session = { id: string; day: 1 | 2; start: string; end: string; title: string; track: Track; speaker: string; room: string; level: "All levels" | "Intermediate" | "Advanced"; blurb: string }

export const sessions: Session[] = [
  { id: "s1", day: 1, start: "09:30", end: "10:15", title: "Wayfinding for the weary", track: "Main stage", speaker: "ingrid", room: "Aurora Hall", level: "All levels", blurb: "What a hospital corridor teaches us about onboarding, and why the best signs say less." },
  { id: "s2", day: 1, start: "10:45", end: "11:30", title: "Pagers are a design problem", track: "Systems", speaker: "kofi", room: "Basalt Room", level: "Intermediate", blurb: "Eight years of on-call, distilled into six rules for alerts a human can act on at 3 a.m." },
  { id: "s3", day: 1, start: "10:45", end: "11:30", title: "The weight between regular and bold", track: "Craft", speaker: "mira", room: "Studio One", level: "Advanced", blurb: "A walk through variable fonts, optical sizes and the weights nobody ships but everybody feels." },
  { id: "s4", day: 1, start: "13:00", end: "13:45", title: "The quiet years", track: "Main stage", speaker: "jun", room: "Aurora Hall", level: "All levels", blurb: "Companies are not built in the launch week. A founder on the long, unglamorous middle." },
  { id: "s5", day: 1, start: "14:15", end: "15:00", title: "What users do with your product on Sunday", track: "Craft", speaker: "amara", room: "Studio One", level: "Intermediate", blurb: "Field research from forty living rooms, and the workarounds that became features." },
  { id: "s6", day: 1, start: "14:15", end: "15:00", title: "Deleting the monolith, a diary", track: "Systems", speaker: "leo", room: "Basalt Room", level: "Advanced", blurb: "Two million lines, one route at a time. What worked, what burned and what we would not do again." },
  { id: "s7", day: 1, start: "16:00", end: "16:45", title: "Subtraction as a roadmap", track: "Main stage", speaker: "sana", room: "Aurora Hall", level: "All levels", blurb: "How removing settings, steps and screens made a product feel twice as fast." },
  { id: "s8", day: 2, start: "09:30", end: "10:15", title: "In praise of the long read", track: "Main stage", speaker: "elena", room: "Aurora Hall", level: "All levels", blurb: "Why a slower publication found a faster audience." },
  { id: "s9", day: 2, start: "10:45", end: "11:30", title: "Easing is a feeling", track: "Craft", speaker: "tomas", room: "Studio One", level: "Intermediate", blurb: "Curves, springs and the physics of things that should feel heavy or light." },
  { id: "s10", day: 2, start: "10:45", end: "11:30", title: "Design for the worst day", track: "Systems", speaker: "freya", room: "Basalt Room", level: "Advanced", blurb: "Recovery flows, audit trails and the screens people only see when something has gone wrong." },
  { id: "s11", day: 2, start: "13:00", end: "13:45", title: "Making light listen", track: "Craft", speaker: "dev", room: "Studio One", level: "Advanced", blurb: "A live build of an installation that responds to a room full of people." },
  { id: "s12", day: 2, start: "13:00", end: "13:45", title: "The ten-minute quickstart", track: "Systems", speaker: "noah", room: "Basalt Room", level: "Intermediate", blurb: "A teardown of five onboarding docs and the step each one should lose." },
  { id: "s13", day: 2, start: "15:00", end: "16:00", title: "Closing conversation: what we will keep", track: "Main stage", speaker: "ingrid", room: "Aurora Hall", level: "All levels", blurb: "Four speakers, one table and the questions you send in during the two days." },
]

export type Tier = { id: string; name: string; price: number; blurb: string; perks: string[]; badge?: string }
export const tiers: Tier[] = [
  { id: "student", name: "Student", price: 190, blurb: "With a valid student ID at the door.", perks: ["Both days, all tracks", "Lunch and coffee", "Recordings next week"] },
  { id: "early", name: "Early bird", price: 490, blurb: "Until 15 January, or 200 tickets.", perks: ["Both days, all tracks", "Lunch, coffee and the Thursday dinner", "Recordings next week", "Speaker Q&A lounge"], badge: "Best value" },
  { id: "standard", name: "Standard", price: 690, blurb: "The full two days.", perks: ["Both days, all tracks", "Lunch, coffee and the Thursday dinner", "Recordings next week", "Speaker Q&A lounge"] },
  { id: "patron", name: "Patron", price: 1290, blurb: "Support the event and sit near the front.", perks: ["Everything in Standard", "Reserved seats in Aurora Hall", "Patrons’ breakfast with the speakers", "Your name on the wall"] },
]

export const faqs = [
  { q: "Will talks be recorded?", a: "Yes. Every main stage and track talk is recorded and sent to ticket holders within a week, with captions." },
  { q: "Is the venue accessible?", a: "All three rooms are step-free, with hearing loops and a quiet room on every floor. Tell us what you need when you buy and we will arrange it." },
  { q: "Can I get a refund?", a: "Full refund until 30 days before the event, then a transfer to another person for free. No questions." },
  { q: "Do you offer childcare?", a: "There is a free, staffed room for children aged three to ten on both days. Add it to your order." },
  { q: "What is the code of conduct?", a: "Be kind, ask before you photograph people and leave a seat for someone standing. Violations are handled by a named, trained team." },
  { q: "Where should I stay?", a: "We hold rooms at three hotels within ten minutes’ walk. Prices are on the venue page and the code is in your ticket email." },
]

export const sponsors = ["Northwind", "Relay", "Parcel", "Lattice", "Tidepool", "Vaultline", "Studio Nine", "Margin"]
export const EVENT_DATE = "2027-05-14T09:00:00Z"
export const speakerById = (id: string) => speakers.find((s) => s.id === id) ?? speakers[0]!
