import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "user-menu",
  type: "registry:ui",
  title: "User Menu",
  description:
    "An account menu on the dropdown: avatar or avatar-with-name trigger, a header card with plan, link groups with shortcuts and badges, a theme submenu and sign out.",
  category: "saas",
  tags: ["account", "avatar", "menu", "theme"],
  files: [{ path: "components/user-menu.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "avatar", "dropdown-menu"],
  examples: [
    { name: "user-menu-demo", title: "Sidebar account", file: "user-menu-demo.tsx" },
    { name: "user-menu-states", title: "Avatar only", file: "user-menu-states.tsx" },
  ],
  ai: {
    summary:
      "user {name,email,image,plan,status}, groups: UserMenuItem[][], theme/onThemeChange, onSignOut, variant avatar | full.",
    whenToUse: ["Headers and sidebar footers", "Account access with theme and sign out"],
    whenNotToUse: ["Switching workspaces; use team-switcher", "Generic action menus; use dropdown-menu"],
    composesWith: ["avatar", "dropdown-menu", "team-switcher"],
    a11y: [
      { keys: "Enter / Space / ArrowDown", action: "Opens the menu" },
      { keys: "Arrow keys and typeahead", action: "Move between items" },
      { keys: "Escape", action: "Closes and returns focus" },
      { keys: "Screen readers", action: "The avatar button names the person; links are real links" },
    ],
    customization: ["variant", "groups with icons, shortcuts and badges", "theme submenu", "open state props"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
