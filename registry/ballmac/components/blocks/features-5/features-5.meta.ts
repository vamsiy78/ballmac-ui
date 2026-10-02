import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "features-5",
  type: "registry:block",
  title: "Features 5: scrolling product tour",
  description: "Numbered steps on the left; as each scrolls into view, a sticky panel on the right crossfades to its picture. On phones every step carries its own picture.",
  category: "blocks",
  blockCategory: "features",
  tags: ["features", "tour", "sticky", "scroll", "steps", "how it works"],
  files: [{ path: "components/blocks/features-5/features-5.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "avatar", "badge", "media"],
  examples: [
    { name: "features-5-demo", title: "Default", file: "features-5-demo.tsx" },
    { name: "features-5-custom", title: "Custom steps", file: "features-5-custom.tsx" },
  ],
  ai: {
    summary: "A how-it-works section that shows the product as you read. Pass steps=[{ title, description, points?, visual }] where visual is any ReactNode.",
    whenToUse: ["Explaining a workflow in three to five steps", "Products where each step has a distinct screen"],
    whenNotToUse: ["Long feature lists (use features-2)", "Pages without room to scroll"],
    composesWith: ["hero-7", "logo-cloud-1", "testimonials-1", "cta-1"],
    a11y: [{ keys: "Scroll", action: "The picture is decorative and hidden from assistive technology, so every step must state what it shows in text" }],
    customization: ["steps: { title, description, points?, visual }[]", "eyebrow, title, description props"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
