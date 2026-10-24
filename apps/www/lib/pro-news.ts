import type { News } from "@/lib/pro-changelog-core"

/**
 * Changes to Ballmac UI Pro that are not one item's version note, newest first. Each is a fact that is recorded in the project's handover notes or git history;
 * add a line when something ships, in plain words and with the date it shipped. No framework imports.
 */
export const PRO_NEWS: News[] = [
  { date: "2026-10-24", tag: "Licence", title: "Refund policy and Team licence", text: "Licence 1.1 adds a refund if an item does not work as its page says and we cannot fix it within 14 days, and defines the Team licence: one organisation, up to 10 named people." },
  { date: "2026-10-12", tag: "Starter", title: "Cove, a desktop notes starter", text: "A Tauri 2 app whose window looks native on macOS and Windows: real window controls, system blur on macOS, native menus and a command palette." },
  { date: "2026-10-11", tag: "Platform", title: "Updates that merge into your edits", text: "Every item has a version and a note, and `ballmac update` merges new versions into files you have changed. A test named after an item installs with it (`--with-tests`)." },
  { date: "2026-10-11", tag: "Platform", title: "Works with Cache Components", text: "Every Pro block and example builds in a fresh Next.js 16.4 app with Cache Components on." },
  { date: "2026-10-05", tag: "Platform", title: "Log in with your key, no CLI needed", text: "Paste your licence key once at /pro/login to read and copy any block, download the starters and get install commands with your key filled in." },
  { date: "2026-10-04", tag: "Starter", title: "Quire, an AI assistant starter", text: "Answers with sources you can click, built on the AI SDK, with a keyless demo model so you can try it before connecting a provider." },
  { date: "2026-10-03", tag: "Starter", title: "Beacon, a SaaS starter", text: "Sign-in, workspaces with invitations, Stripe billing, a dashboard, API keys and a marketing site." },
  { date: "2026-10-03", tag: "Kit", title: "Figma design tokens for every theme", text: "Thirteen themes as design tokens, light and dark, ready to import into Figma." },
]
