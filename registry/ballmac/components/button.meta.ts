import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "button",
  type: "registry:ui",
  title: "Button",
  description:
    "A button with six variants, three sizes, a pill shape and a built-in loading state. buttonVariants() styles links the same way.",
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
    whenToUse: ["Primary and secondary actions", "Form submit buttons", "Links that should look like buttons (className={buttonVariants()} on an <a>)"],
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
  version: "1.0.3",
  updated: "2026-10-12",
  changelog: [
    { version: "1.0.3", date: "2026-10-12", note: "A loading button keeps its label in the accessibility tree (opacity instead of visibility), so a busy button still has a name." },
    { version: "1.0.2", date: "2026-10-11", note: "Control heights, menu and sidebar row sizes, press dimming and frosted surfaces follow the platform feel tokens (--bm-control-h, --bm-menu-*, --bm-sidebar-*, --bm-material-*). Unchanged without a feel." },
    { version: "1.0.1", date: "2026-10-11", note: "Hover lift and press depth follow the theme's --bm-lift and --bm-hover tokens. Unchanged by default." },
    { version: "1.0.0", date: "2026-09-28", note: "First release." },
  ],
})
