import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "phone-input",
  type: "registry:ui",
  title: "Phone Input",
  description:
    "A native dialing-code selector paired with a telephone field that preserves the user’s formatting.",
  category: "forms",
  tags: ["phone", "telephone", "country"],
  files: [{ path: "components/phone-input.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "phone-input-demo",
      title: "Overview",
      file: "phone-input-demo.tsx",
    },
    {
      name: "phone-input-states",
      title: "States and variants",
      file: "phone-input-states.tsx",
    },
  ],
  ai: {
    summary:
      "A native dialing-code selector paired with a telephone field that preserves the user’s formatting.",
    whenToUse: [
      "Collect a contact number with a dialing prefix",
      "Edit a national number without forced formatting",
    ],
    whenNotToUse: ["Use input type tel when a country selector is unnecessary"],
    composesWith: ["input"],
    a11y: [
      {
        keys: "Arrow Up / Down",
        action: "Changes the native dialing-code selection",
      },
      { keys: "Tab", action: "Moves to the telephone field" },
    ],
    customization: [
      "countries, countryCodeName",
      "value / defaultValue and onValueChange",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
