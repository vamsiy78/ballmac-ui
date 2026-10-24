import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "access-1",
  type: "registry:block",
  title: "Access 1: access review",
  description:
    "A periodic access review: each person's role and last use, Keep, Reduce or Remove with lower roles only, people idle for months flagged in words, a keep-everyone-active shortcut, progress, and a confirmation before anyone loses access.",
  category: "blocks",
  blockCategory: "access",
  tags: ["access review", "permissions", "roles", "security", "compliance", "admin", "least privilege"],
  files: [{ path: "components/blocks/access-1/access-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "button", "skeleton", "state-view", "return-focus"],
  examples: [
    { name: "access-1-demo", title: "Default", file: "access-1-demo.tsx" },
    { name: "access-1-flagged", title: "Reviewing the flagged first", file: "access-1-flagged.tsx" },
    { name: "access-1-loading", title: "Loading", file: "access-1-loading.tsx" },
    { name: "access-1-empty", title: "Nobody to review", file: "access-1-empty.tsx" },
    { name: "access-1-error", title: "Could not load", file: "access-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "access-1-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "empty", title: "Nobody to review", example: "access-1-empty", trigger: "state=\"empty\"", note: "Says nobody is to review; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "access-1-error", trigger: "state=\"error\"", note: "An alert saying no decisions were lost, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A quarterly access review. <Access1 people={[{ id, name, email, role, lastUsed: '3 days ago', idleDays: 3 }]} roles={['Owner','Admin','Member','Viewer']} flagAfterDays={90} due='Due 31 Oct' onSubmit={(decisions) => Promise} />. Each person gets Keep, Reduce (to a lower role) or Remove; undecided people stay as they are. Submit is off until everyone has a decision and asks first when anyone will be removed.",
    whenToUse: ["A workspace admin's quarterly check of who has access", "A compliance task that needs a record of every keep, reduce and remove"],
    whenNotToUse: ["Inviting or changing one person's role; use settings or team blocks", "A log of past changes; use audit-1"],
    composesWith: ["audit-1", "settings-1", "invite-1", "app-shell-1"],
    a11y: [
      { keys: "Decisions", action: "Each person's Keep, Reduce and Remove are a native radio group in a fieldset named for them; the arrow keys move between them" },
      { keys: "Progress", action: "A meter reading '3 of 7 reviewed'; what is left is also written under the list" },
      { keys: "Flagged people", action: "Marked 'not used lately' in words with an icon, not colour alone" },
      { keys: "Removing", action: "An alert dialog names exactly who loses access and returns focus when closed" },
    ],
    customization: ["roles and flagAfterDays", "due text", "onSubmit receives { [id]: { action, to? } }; reject it and the message says nothing was saved"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
