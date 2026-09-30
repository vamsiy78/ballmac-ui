import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "workspace-card",
  type: "registry:ui",
  title: "Workspace Card",
  description:
    "A workspace or team card with a generated cover and logo tile, plan, member faces, project and storage stats, a current badge, an actions menu and a loading state.",
  category: "saas",
  tags: ["workspace", "team", "card", "members"],
  files: [{ path: "components/workspace-card.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "avatar", "dropdown-menu"],
  examples: [
    { name: "workspace-card-demo", title: "Workspace grid", file: "workspace-card-demo.tsx" },
    { name: "workspace-card-states", title: "Loading and minimal", file: "workspace-card-states.tsx" },
  ],
  ai: {
    summary:
      "workspace {name,description,plan,members,memberCount,projects,storage,lastActive}, href or onOpen, current, actions[], loading. The title is the card's single link.",
    whenToUse: ["Workspace pickers and team lists", "Account overview pages"],
    whenNotToUse: ["A dropdown switcher; use team-switcher", "Generic content cards; use card"],
    composesWith: ["team-switcher", "avatar", "usage-meter"],
    a11y: [
      { keys: "Tab", action: "One link per card (the title); the actions menu is a separate button" },
      { keys: "Screen readers", action: "Storage is a labelled meter; loading state sets aria-busy" },
    ],
    customization: ["current", "actions", "href vs onOpen", "cover and logo color come from the name"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
