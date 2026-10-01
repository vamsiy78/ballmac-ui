import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "template-workspace",
  type: "registry:block",
  title: "Parcel: productivity workspace",
  description:
    "A five-app productivity suite in one shell: a Today page with agenda, tasks and a focus timer, plus a full mail client, week calendar, drag-and-drop board and settings. A tab bar on phones.",
  category: "templates",
  templateKind: "application",
  templatePages: [
    { title: "Today", example: "template-workspace-demo", path: "/workspace" },
    { title: "Mail", example: "template-workspace-mail", path: "/workspace/mail" },
    { title: "Calendar", example: "template-workspace-calendar", path: "/workspace/calendar" },
    { title: "Board", example: "template-workspace-board", path: "/workspace/board" },
    { title: "Settings", example: "template-workspace-settings", path: "/workspace/settings" },
  ],
  fonts: ["Albert Sans"],
  featured: true,
  tags: ["template", "productivity", "mail", "calendar", "kanban", "tasks", "workspace", "app shell"],
  files: [
    { path: "components/templates/workspace/workspace-fonts.ts" },
    { path: "components/templates/workspace/workspace-theme.tsx" },
    { path: "components/templates/workspace/workspace-today.tsx" },
    { path: "components/templates/workspace/workspace-mail.tsx" },
    { path: "components/templates/workspace/workspace-calendar.tsx" },
    { path: "components/templates/workspace/workspace-board.tsx" },
    { path: "components/templates/workspace/workspace-settings.tsx" },
    { path: "app/workspace/page.tsx" },
    { path: "app/workspace/mail/page.tsx" },
    { path: "app/workspace/calendar/page.tsx" },
    { path: "app/workspace/board/page.tsx" },
    { path: "app/workspace/settings/page.tsx" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "calendar-1", "command", "kanban-1", "mail-1", "settings-1"],
  examples: [
    { name: "template-workspace-demo", title: "Today", file: "template-workspace-demo.tsx" },
    { name: "template-workspace-mail", title: "Mail", file: "template-workspace-mail.tsx" },
    { name: "template-workspace-calendar", title: "Calendar", file: "template-workspace-calendar.tsx" },
    { name: "template-workspace-board", title: "Board", file: "template-workspace-board.tsx" },
    { name: "template-workspace-settings", title: "Settings", file: "template-workspace-settings.tsx" },
  ],
  docs: "Pages are at /workspace, /workspace/mail, /workspace/calendar, /workspace/board and /workspace/settings. Mail, calendar, board and settings are the Ballmac blocks: pass them your data through their props.",
  ai: {
    summary:
      "Installs a multi-app productivity shell. WorkspaceShell gives every page an app rail (a tab bar on phones) and a command menu; each app page wraps a Ballmac block you can feed with your own data.",
    whenToUse: ["Suites that combine several tools under one navigation", "Starting point for team inboxes, planners and internal tools"],
    whenNotToUse: ["A single dashboard (use template-atlas)"],
    composesWith: ["mail-1", "calendar-1", "kanban-1"],
    a11y: [
      { keys: "⌘K / Ctrl+K", action: "Opens the command menu to jump between apps" },
      { keys: "J / K in mail", action: "Moves between messages" },
    ],
    customization: ["Edit workspaceCss for the palette", "Add an app to the apps array in workspace-theme.tsx", "Pass data props to the Mail1, Calendar1 and Kanban1 blocks"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
