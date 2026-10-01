import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "settings-2",
  type: "registry:block",
  title: "Settings 2: notification preferences",
  description: "Notification settings that save as you go: digest frequency as radio cards, a grid of switches for each event and channel (cards on phones), and quiet hours with times and weekdays.",
  category: "blocks",
  blockCategory: "settings",
  tags: ["settings", "notifications", "preferences", "switches", "quiet hours", "digest"],
  files: [{ path: "components/blocks/settings-2/settings-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "input", "switch", "toggle-group"],
  examples: [
    { name: "settings-2-demo", title: "Default", file: "settings-2-demo.tsx" },
    { name: "settings-2-custom", title: "Your events", file: "settings-2-custom.tsx" },
  ],
  ai: {
    summary: "Notification preferences with instant saving. Pass events=[{ id, label, description }], defaultValues and onChange(values) (return a promise; throw to show an error).",
    whenToUse: ["Notification, alert and email preference pages", "Settings that apply the moment they are toggled"],
    whenNotToUse: ["Forms that need an explicit Save (use settings-1)"],
    composesWith: ["app-shell-1", "settings-1", "settings-3"],
    a11y: [
      { keys: "Arrow keys / Space", action: "Digest radios move and select; switches toggle with Space" },
      { keys: "Screen reader", action: "Each switch is named 'Event by Channel'; the saving state is announced politely" },
      { keys: "Weekdays", action: "A toggle group with full day names as labels" },
    ],
    customization: ["events: { id, label, description }[]", "defaultValues: digest, events, quiet", "onChange(values) async"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
