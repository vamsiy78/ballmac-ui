import type { MediaSource } from "@/components/ballmac/media"

// Ballmac UI: Studio sample content. https://ui.ballmac.com/templates/template-studio

export type StudioProject = { slug: string; name: string; client: string; year: string; discipline: "Brand" | "Digital" | "Campaign"; line: string; art: number; image?: MediaSource; imageAlt?: string }

export const projects: StudioProject[] = [
  { slug: "north-coast", name: "North Coast Rail", client: "North Coast", year: "2026", discipline: "Brand", line: "A railway identity that moves.", art: 0 },
  { slug: "oat-and-ember", name: "Oat & Ember", client: "Oat & Ember", year: "2026", discipline: "Campaign", line: "A launch that sold out in nine days.", art: 1 },
  { slug: "meridian", name: "Meridian Bank", client: "Meridian", year: "2025", discipline: "Digital", line: "Banking without the small print.", art: 2 },
  { slug: "tidal", name: "Tidal Festival", client: "Tidal", year: "2025", discipline: "Brand", line: "Three days, one living identity.", art: 3 },
  { slug: "pilot", name: "Pilot Coffee", client: "Pilot", year: "2025", discipline: "Campaign", line: "Packaging that earned its shelf.", art: 4 },
  { slug: "alder", name: "Alder & Co", client: "Alder", year: "2024", discipline: "Digital", line: "A furniture shop built on stories.", art: 5 },
]

export const services = [
  { n: "01", title: "Brand identity", text: "Strategy, naming, logos, typefaces and the system that holds them together. We leave you with a brand people can actually use on a Tuesday.", items: ["Positioning", "Naming", "Visual identity", "Brand guidelines"], from: "From €45k" },
  { n: "02", title: "Digital design", text: "Websites and products with a point of view. Designed in the browser, built with your team, and measured after launch.", items: ["Websites", "Product design", "Design systems", "Motion"], from: "From €60k" },
  { n: "03", title: "Campaigns", text: "Ideas that travel. We direct, shoot and launch across print, social, film and the street.", items: ["Concept", "Art direction", "Film and photography", "Launch"], from: "From €35k" },
  { n: "04", title: "Retained studio", text: "A senior team on call for a monthly fee. For brands that ship constantly and want one look across everything.", items: ["Monthly capacity", "Quarterly roadmap", "Priority access"], from: "From €12k / month" },
]

export const process = [
  ["Listen", "Two weeks of interviews, audits and arguments. We write down what is true before we make anything pretty."],
  ["Make", "Small, fast, ugly first. You see work every week, not a reveal at the end."],
  ["Launch", "We stay until it is live, then measure it. The work isn't finished when it is delivered."],
]
