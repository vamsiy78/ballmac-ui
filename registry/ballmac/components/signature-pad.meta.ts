import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "signature-pad",
  type: "registry:ui",
  title: "Signature Pad",
  description:
    "A responsive pointer signature surface with a full keyboard-accessible typed alternative and undo.",
  category: "forms",
  tags: ["signature", "drawing", "form"],
  files: [{ path: "components/signature-pad.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "signature-pad-demo",
      title: "Overview",
      file: "signature-pad-demo.tsx",
    },
    {
      name: "signature-pad-states",
      title: "States and variants",
      file: "signature-pad-states.tsx",
    },
  ],
  ai: {
    summary:
      "A responsive pointer signature surface with a full keyboard-accessible typed alternative and undo.",
    whenToUse: ["Capture a signer name or freehand mark"],
    whenNotToUse: ["Use a text input when a signature is not required"],
    composesWith: ["input"],
    a11y: [
      {
        keys: "Tab / Enter / Space / typing",
        action:
          "Switches methods, types a name, and clears or undoes the signature",
      },
    ],
    customization: [
      "Controlled and uncontrolled value",
      "Tokens and state styling",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
