/** The jobs people come to Ballmac UI to do, each with the blocks, templates and guides that do it. Every name here must be a free item or a docs page: a test checks. */
export type UseCase = {
  slug: string
  /** Short name, for lists and the footer. */
  name: string
  /** The page's h1, and what the page is for in search. */
  title: string
  description: string
  intro: string
  blocks: string[]
  templates: string[]
  docs: { href: string; label: string }[]
  /** The gallery search that finds more of the same. */
  query: string
}

export const useCases: UseCase[] = [
  {
    slug: "dashboard",
    name: "Dashboards",
    title: "React dashboard components for shadcn and Tailwind",
    description: "Sales and traffic dashboards, an app shell, funnels, retention and a status page: React blocks with charts, loading, empty and error states, installed as code.",
    intro: "Start from a finished dashboard instead of a blank page. These blocks draw the charts, the KPI cards and the tables, work out every number from the data you pass, and show a skeleton, an empty message or an error with a retry when the data isn't ready.",
    blocks: ["dashboard-1", "dashboard-2", "app-shell-1", "funnel-1", "retention-1", "status-1"],
    templates: ["template-atlas", "template-workspace"],
    docs: [
      { href: "/docs/get-started/build-a-dashboard", label: "Build a sales dashboard" },
      { href: "/docs/guides/states", label: "Handle loading, empty and error states" },
      { href: "/docs/get-started/make-it-yours", label: "Set your brand color" },
    ],
    query: "dashboard",
  },
  {
    slug: "desktop-app",
    name: "Desktop apps",
    title: "UI for Tauri and Electron desktop apps in React",
    description: "Preferences, a menu bar panel, software update, licence activation, permissions and About windows that look native on macOS and Windows, with the window chrome to go around them.",
    intro: "The windows every desktop app needs, drawn with real window chrome and handling like macOS or Windows. Pick one feel for your app or let the device choose before the first paint.",
    blocks: ["desktop-1", "desktop-2", "desktop-3", "desktop-4", "desktop-5", "desktop-8"],
    templates: ["template-ledger"],
    docs: [
      { href: "/docs/guides/desktop-app", label: "Ship a desktop app" },
      { href: "/docs/guides/platform-feels", label: "Pick a platform feel" },
      { href: "/docs/concepts/platform-feels", label: "How platform feels work" },
    ],
    query: "desktop",
  },
  {
    slug: "ai-agent",
    name: "AI agents and chat",
    title: "React components for AI agent and chat interfaces",
    description: "A live agent run, an approvals inbox, runs and traces, a prompt playground, an agent builder and chat panes: the screens for products where agents do the work and people stay in charge.",
    intro: "Show what an agent is doing, let people approve what it asks for, and look back at what it did. Each block covers the cases a demo skips: waiting for you, a failed step, a stop button.",
    blocks: ["agent-1", "agent-2", "agent-3", "agent-4", "agent-7", "ai-chat-1"],
    templates: ["template-muse", "template-orbit"],
    docs: [
      { href: "/docs/guides/states", label: "Handle loading, empty and error states" },
      { href: "/docs/get-started/connect-your-agent", label: "Connect your AI agent" },
      { href: "/docs/concepts/built-for-agents", label: "Built for AI agents" },
    ],
    query: "agent",
  },
  {
    slug: "landing-page",
    name: "Landing pages",
    title: "React landing page sections for shadcn and Tailwind",
    description: "Heroes, features, pricing, testimonials, FAQ and calls to action as responsive React sections, plus whole product sites built from them.",
    intro: "Assemble a landing page from sections that already agree on spacing, type and motion, or install a whole site and change the words. Every section works in light and dark and mirrors for right-to-left languages.",
    blocks: ["hero-1", "features-1", "pricing-2", "testimonials-1", "faq-1", "cta-1"],
    templates: ["template-launch", "template-northwind"],
    docs: [
      { href: "/docs/guides/images", label: "Use your own images" },
      { href: "/docs/get-started/make-it-yours", label: "Set your brand color" },
      { href: "/docs/guides/right-to-left", label: "Turn on right-to-left" },
    ],
    query: "hero",
  },
  {
    slug: "admin-tools",
    name: "Admin and internal tools",
    title: "React components for admin panels and internal tools",
    description: "Support tickets, webhooks, feature flags, an automation builder, an API explorer and a CRM record: the screens internal tools and developer products are made of.",
    intro: "The dense, careful screens behind a product. They keep your work when a save fails, say what will happen before you change production, and are operable from the keyboard.",
    blocks: ["tickets-1", "webhooks-1", "flags-1", "workflow-1", "api-1", "crm-1"],
    templates: ["template-atlas"],
    docs: [
      { href: "/docs/guides/states", label: "Handle loading, empty and error states" },
      { href: "/docs/guides/check-your-app", label: "Check your own app" },
      { href: "/docs/guides/update-components", label: "Update components without losing your edits" },
    ],
    query: "manager",
  },
  {
    slug: "auth-and-settings",
    name: "Sign-in and settings",
    title: "React sign-in, onboarding and account settings screens",
    description: "Login, sign up, onboarding, profile, team, integrations and data and privacy settings as React blocks with validation, submitting and error states.",
    intro: "The first screens a customer sees and the settings they come back for. Forms lock while a request is in flight, so nothing is sent twice, and every form block can show submitting, success and error.",
    blocks: ["login-1", "signup-1", "onboarding-1", "settings-1", "settings-3", "settings-6"],
    templates: ["template-auth-kit"],
    docs: [
      { href: "/docs/guides/states", label: "Handle loading, empty and error states" },
      { href: "/docs/guides/translate", label: "Translate Ballmac UI" },
      { href: "/docs/get-started/install", label: "Install your first component" },
    ],
    query: "settings",
  },
]

export const getUseCase = (slug: string) => useCases.find((u) => u.slug === slug)
