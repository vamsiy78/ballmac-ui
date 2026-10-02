import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "team-switcher",
  type: "registry:ui",
  title: "Team Switcher",
  description:
    "A workspace picker: the current team on a button, the others in a radio menu with logos and descriptions, an add-team row, and a compact icon mode.",
  category: "navigation",
  tags: ["workspace", "switcher", "menu", "dropdown"],
  files: [{ path: "components/team-switcher.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "dropdown-menu", "i18n", "media"],
  examples: [
    { name: "team-switcher-demo", title: "Workspace menu", file: "team-switcher-demo.tsx" },
    { name: "team-switcher-states", title: "Compact", file: "team-switcher-states.tsx" },
  ],
  ai: {
    summary:
      "teams: {id,name,description,logo}. value/defaultValue/onValueChange choose the active team; onAddTeam adds the last row; compact shows only the logo.",
    whenToUse: ["Multi-workspace apps in a sidebar or header", "Switching organizations or projects"],
    whenNotToUse: ["Choosing a value in a form; use select or combobox", "Long searchable lists; use combobox"],
    composesWith: ["sidebar", "app-shell", "avatar"],
    a11y: [
      { keys: "Enter / Space / ArrowDown", action: "Opens the menu" },
      { keys: "ArrowUp / ArrowDown", action: "Moves between teams" },
      { keys: "Enter", action: "Chooses the team" },
      { keys: "Escape", action: "Closes and returns focus" },
    ],
    customization: ["compact", "logo per team", "onAddTeam and addLabel", "side and align"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
