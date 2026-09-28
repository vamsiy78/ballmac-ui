import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "button",
  type: "registry:ui",
  title: "Button",
  description:
    "A button with six variants, three sizes, a pill shape and a built-in loading state. Renders any element with asChild.",
  category: "primitives",
  tags: ["button", "cta", "loading", "radix"],
  files: [{ path: "components/button.tsx" }],
  dependencies: ["radix-ui", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "button-demo", title: "Default", file: "button-demo.tsx" },
    { name: "button-variants", title: "Variants", file: "button-variants.tsx" },
    { name: "button-loading", title: "Loading", file: "button-loading.tsx" },
  ],
  ai: {
    summary: "The base action control. Use variant for emphasis, size for density, and loading while an async action runs.",
    whenToUse: ["Primary and secondary actions", "Form submit buttons", "Links that should look like buttons (asChild with <a>)"],
    whenNotToUse: ["Navigation inside running text (use a link)", "Toggling state (use a switch or toggle)"],
    composesWith: ["kbd", "tooltip"],
    a11y: [
      { keys: "Enter / Space", action: "Activates the button" },
      { keys: "Tab", action: "Moves focus to the button" },
    ],
    customization: ["variant: default | secondary | outline | ghost | link | destructive", "size: sm | default | lg | icon | icon-sm", "shape: default | pill"],
  },
  source: {
    name: "shadcn/ui Button",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
