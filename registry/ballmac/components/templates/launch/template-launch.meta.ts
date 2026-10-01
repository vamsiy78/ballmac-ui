import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-launch",
  type: "registry:block",
  title: "Beacon: launch site from blocks",
  description:
    "A four-page product site assembled entirely from Ballmac blocks (Hero6, Stats1, Features5, Testimonials2, Cta3, Pricing2, Pricing3, Faq2, Changelog1, Contact1) in one palette, so any section can be swapped for another block.",
  category: "templates",
  templateKind: "marketing",
  templatePages: [
    { title: "Home", example: "template-launch-demo", path: "/launch" },
    { title: "Pricing", example: "template-launch-pricing", path: "/launch/pricing" },
    { title: "Changelog", example: "template-launch-changelog", path: "/launch/changelog" },
    { title: "Contact", example: "template-launch-contact", path: "/launch/contact" },
  ],
  fonts: ["Schibsted Grotesk", "Geist Mono"],
  featured: true,
  tags: ["template", "landing page", "launch", "saas", "marketing", "blocks"],
  files: [
    { path: "components/templates/launch/launch-fonts.ts" },
    { path: "components/templates/launch/launch-theme.tsx" },
    { path: "components/templates/launch/launch-page.tsx" },
    { path: "components/templates/launch/launch-pricing.tsx" },
    { path: "components/templates/launch/launch-changelog.tsx" },
    { path: "components/templates/launch/launch-contact.tsx" },
    { path: "app/launch/page.tsx" },
    { path: "app/launch/pricing/page.tsx" },
    { path: "app/launch/changelog/page.tsx" },
    { path: "app/launch/contact/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "header-2", "footer-2", "hero-6", "logo-cloud-1", "stats-1", "features-5", "testimonials-2", "cta-3", "pricing-2", "pricing-3", "faq-2", "changelog-1", "contact-1"],
  examples: [
    { name: "template-launch-demo", title: "Home", file: "template-launch-demo.tsx" },
    { name: "template-launch-pricing", title: "Pricing", file: "template-launch-pricing.tsx" },
    { name: "template-launch-changelog", title: "Changelog", file: "template-launch-changelog.tsx" },
    { name: "template-launch-contact", title: "Contact", file: "template-launch-contact.tsx" },
  ],
  docs: "Pages are at /launch, /launch/pricing, /launch/changelog and /launch/contact. Each page is LaunchShell (header, footer, palette) around Ballmac blocks: change copy through the blocks' props, reorder them, or swap any block for another in the same category. Edit launchCss in launch-theme.tsx for the palette.",
  ai: {
    summary:
      "Installs a four-page product site built entirely from Ballmac blocks in one palette. Change copy through block props, swap blocks freely, and edit launchCss for the look.",
    whenToUse: ["A new SaaS or developer-tool site you will customize section by section", "A starting point that shows how blocks compose"],
    whenNotToUse: ["Adding one section to an existing page (install that block instead)"],
    composesWith: ["hero-7", "features-6", "testimonials-1", "pricing-1"],
    a11y: [
      { keys: "Tab and Enter in the header", action: "Open the navigation; the mobile menu is a sheet" },
      { keys: "Arrow keys on the quote dots", action: "Change the testimonial" }
    ],
    customization: ["Swap any block for another in the same category", "Pass your copy to each block's props", "Edit launchCss for the palette", "Rename the route folder app/launch"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
