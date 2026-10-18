import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "return-focus",
  type: "registry:lib",
  title: "Return focus",
  description: "A hook that puts keyboard focus back on the element that opened a dialog, for dialogs opened from state, which have no trigger for Radix to return focus to.",
  category: "foundation",
  tags: ["dialog", "focus", "keyboard", "accessibility", "modal", "alert dialog"],
  files: [{ path: "lib/return-focus.ts" }],
  dependencies: [],
  ai: {
    summary: "const returnFocus = useReturnFocus(open); <DialogContent {...returnFocus}>. Use it when a dialog is controlled with open and opened by your own code (a Delete button that asks to confirm). Dialogs with a DialogTrigger do not need it.",
    whenToUse: ["Any Dialog or AlertDialog that is opened from state rather than from a DialogTrigger", "A lightbox or confirmation opened from a list item"],
    whenNotToUse: ["A dialog that already uses DialogTrigger, which returns focus by itself"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
