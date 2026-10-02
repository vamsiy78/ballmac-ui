import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "slider",
  type: "registry:ui",
  title: "Slider",
  description:
    "A single or range slider with a name per thumb, a live value bubble, vertical orientation and full keyboard control, built on Radix.",
  category: "forms",
  tags: ["input", "range", "form", "radix"],
  files: [{ path: "components/slider.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils", "direction"],
  examples: [
    { name: "slider-demo", title: "Volume and price", file: "slider-demo.tsx" },
    { name: "slider-states", title: "Vertical and disabled", file: "slider-states.tsx" },
  ],
  ai: {
    summary:
      "Drag or use the keyboard to pick a number or a range. Give every thumb a name with thumbLabels; showValue adds a bubble on hover, focus and drag.",
    whenToUse: ["Volume, brightness and zoom", "Price and date ranges with two thumbs", "Any bounded numeric choice where precision is not critical"],
    whenNotToUse: ["Exact numeric entry; use number-input", "A styled range with marks or steps shown; use slider-range"],
    composesWith: ["label", "field"],
    a11y: [
      { keys: "ArrowLeft / ArrowRight / ArrowUp / ArrowDown", action: "Changes the value by one step" },
      { keys: "PageUp / PageDown", action: "Changes by a larger step" },
      { keys: "Home / End", action: "Jumps to min or max" },
      { keys: "Tab", action: "Moves between thumbs" },
    ],
    customization: ["min, max, step", "thumbLabels for range sliders", "showValue and formatValue", "orientation: horizontal | vertical"],
  },
  source: {
    name: "shadcn/ui Slider",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
