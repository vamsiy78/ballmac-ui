import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "product-art",
  type: "registry:ui",
  title: "Product Art",
  description:
    "Soft square placeholders with a simple object drawn in a chart color, for product grids, carts and detail pages before real photos exist, or as the fallback when a photo fails to load. Theme tokens only.",
  category: "marketing",
  tags: ["ecommerce", "product", "placeholder", "illustration", "image", "shop", "fallback"],
  files: [{ path: "components/product-art.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "product-art-demo", title: "Six objects", file: "product-art-demo.tsx" },
    { name: "product-art-tones", title: "Five tones", file: "product-art-tones.tsx" },
  ],
  ai: {
    summary:
      "kind is 'speaker' | 'mug' | 'bag' | 'lamp' | 'bottle' | 'headphones'; tone is 1 to 5 (the chart color that tints the background and the object). It fills the width it is given as a square. Pass label to describe it as an image; without a label it is hidden from screen readers.",
    whenToUse: ["Product cards and galleries in demos, templates and loading states", "A fallback when a product photo is missing"],
    whenNotToUse: ["Real product photography; use an image", "Icons; use lucide-react"],
    composesWith: ["ecommerce-1", "ecommerce-2", "ecommerce-3", "ecommerce-4"],
    a11y: [
      { keys: "Image", action: "Decorative by default (aria-hidden); with label it is role=img with that name" },
    ],
    customization: ["kind and tone", "label", "className for the shape"],
  },
  statesNone: "A static illustration: nothing to load or fail.",
  version: "1.0.0",
  updated: "2026-10-25",
})
