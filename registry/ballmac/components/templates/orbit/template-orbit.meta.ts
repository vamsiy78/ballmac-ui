import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-orbit",
  type: "registry:block",
  title: "Orbit: AI agent platform",
  description:
    "A dark, four-page site for an AI agent platform: a hero that plays a live agent run, tools, an eval chart, traces, security, pricing with a usage calculator, a changelog and sign-in.",
  category: "templates",
  templateKind: "marketing",
  templatePages: [
    { title: "Home", example: "template-orbit-demo", path: "/orbit" },
    { title: "Pricing", example: "template-orbit-pricing", path: "/orbit/pricing" },
    { title: "Changelog", example: "template-orbit-changelog", path: "/orbit/changelog" },
    { title: "Sign in", example: "template-orbit-login", path: "/orbit/login" },
  ],
  fonts: ["Instrument Sans", "JetBrains Mono"],
  featured: true,
  tags: ["template", "ai", "agents", "saas", "dark", "landing page", "pricing", "changelog"],
  files: [
    { path: "components/templates/orbit/orbit-fonts.ts" },
    { path: "components/templates/orbit/orbit-theme.tsx" },
    { path: "components/templates/orbit/orbit-agent-run.tsx" },
    { path: "components/templates/orbit/orbit-home.tsx" },
    { path: "components/templates/orbit/orbit-pricing.tsx" },
    { path: "components/templates/orbit/orbit-changelog.tsx" },
    { path: "components/templates/orbit/orbit-login.tsx" },
    { path: "app/orbit/page.tsx" },
    { path: "app/orbit/pricing/page.tsx" },
    { path: "app/orbit/changelog/page.tsx" },
    { path: "app/orbit/login/page.tsx" },
  ],
  dependencies: ["lucide-react", "motion@^12", "recharts@^3"],
  registryDependencies: ["shadcn:utils", "accordion", "aurora-background", "blur-fade", "changelog-feed", "chart", "copy-button", "marquee", "number-ticker", "segmented-control", "slider"],
  examples: [
    { name: "template-orbit-demo", title: "Home", file: "template-orbit-demo.tsx" },
    { name: "template-orbit-pricing", title: "Pricing", file: "template-orbit-pricing.tsx" },
    { name: "template-orbit-changelog", title: "Changelog", file: "template-orbit-changelog.tsx" },
    { name: "template-orbit-login", title: "Sign in", file: "template-orbit-login.tsx" },
  ],
  docs: "Pages are at /orbit, /orbit/pricing, /orbit/changelog and /orbit/login. The palette lives in orbit-theme.tsx (orbitVars); fonts load through next/font in orbit-fonts.ts.",
  ai: {
    summary:
      "Installs a four-page dark site for an AI product. Change the palette in orbit-theme.tsx (orbitVars), the copy in each page file, and the agent-run script (steps) in orbit-agent-run.tsx.",
    whenToUse: ["Marketing sites for AI agents, LLM tooling or developer platforms", "A dark, high-contrast brand with a live product demo in the hero"],
    whenNotToUse: ["Light, editorial brands (a Northwind-style template)", "Mac app landing pages (a Ledger-style template)"],
    composesWith: ["pricing-3", "changelog-1", "faq-2"],
    customization: ["Edit orbitVars for the palette", "Edit steps in OrbitAgentRun to script your own demo run", "Swap fonts in orbit-fonts.ts"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
