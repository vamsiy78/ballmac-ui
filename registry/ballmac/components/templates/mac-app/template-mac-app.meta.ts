import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-mac-app",
  type: "registry:block",
  title: "Mac app landing page",
  description:
    "A complete landing page for a Mac app: header, hero with an opening laptop, logo cloud, Mac feature bento, testimonials, one-time pricing, FAQ, beta signup and footer.",
  category: "templates",
  templateKind: "marketing",
  templatePages: [{ title: "Home", example: "template-mac-app-demo", path: "/mac-app" }],
  featured: true,
  tags: ["template", "landing page", "mac app", "desktop", "download"],
  files: [{ path: "components/templates/mac-app/mac-app-page.tsx" }, { path: "app/mac-app/page.tsx" }],
  registryDependencies: ["cta-2", "faq-1", "features-4", "footer-1", "header-1", "hero-5", "logo-cloud-1", "pricing-1", "testimonials-1"],
  examples: [{ name: "template-mac-app-demo", title: "Mac app landing page", file: "template-mac-app-demo.tsx" }],
  docs: "The page is at /mac-app. Edit components/ballmac/templates/mac-app/mac-app-page.tsx to change the copy and sections.",
  ai: {
    summary:
      "Installs a working /mac-app route for a desktop app built from Ballmac blocks. Change copy through each block's props in mac-app-page.tsx; move the route by moving app/mac-app/page.tsx.",
    whenToUse: ["Landing pages for Mac or desktop apps", "Indie app launches with a free tier and a one-time Pro purchase"],
    whenNotToUse: ["Web SaaS landing pages (use template-launch)"],
    composesWith: ["template-launch", "hero-4"],
    customization: ["Header and footer brand", "Pricing plans (one-time or subscription)", "FAQ items", "Hero screen: pass a screenshot via Hero5 `screen`"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
