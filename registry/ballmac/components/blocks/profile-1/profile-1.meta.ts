import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "profile-1",
  type: "registry:block",
  title: "Profile 1: public profile",
  description:
    "A public profile: cover and avatar art drawn from the handle, a verified badge, Follow that updates the count and undoes itself on failure, stats that count up, About, pointer-lit project cards and an Activity tab.",
  category: "blocks",
  blockCategory: "profile",
  tags: ["profile", "user", "public profile", "portfolio", "follow", "social", "creator", "community", "activity"],
  files: [{ path: "components/blocks/profile-1/profile-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "animated-tabs", "avatar", "badge", "blur-fade", "button", "contribution-graph", "cover-art", "media", "number-ticker", "skeleton", "spotlight-card", "state-view"],
  examples: [
    { name: "profile-1-demo", title: "Default", file: "profile-1-demo.tsx" },
    { name: "profile-1-following", title: "Already following, Activity tab", file: "profile-1-following.tsx" },
    { name: "profile-1-loading", title: "Loading", file: "profile-1-loading.tsx" },
    { name: "profile-1-empty", title: "No projects yet", file: "profile-1-empty.tsx" },
    { name: "profile-1-error", title: "Could not load", file: "profile-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "profile-1-loading", trigger: "state=\"loading\"", note: "A skeleton of the cover, avatar and project cards, announced as loading." },
    { id: "empty", title: "No projects yet", example: "profile-1-empty", trigger: "state=\"empty\" (or projects={[]})", note: "The profile shows as usual and the Work tab says nothing is shared yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "profile-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A public profile page. <Profile1 person={{ name, handle, headline, bio, location, joined, verified, avatar, cover, availability, followers, following, isFollowing, skills, links }} projects={[{ id, title, description, tags, stars, updated, href, cover }]} activity={[{ date, count }]} recent={[{ id, text, time }]} onFollow={async (next) => …} onMessage onShare />. Without images it draws cover and avatar art from the handle and each project's id. Follow is optimistic: throw from onFollow to undo it.",
    whenToUse: ["The public page of a member, creator, designer or developer in a community or marketplace", "A portfolio-style profile with projects and activity"],
    whenNotToUse: ["Editing your own account (use settings-1)", "A company About page (use team-1)", "An article author box (use blog-post-1)"],
    composesWith: ["app-shell-1", "chat-1", "header-2", "footer-2"],
    a11y: [
      { keys: "Tab", action: "Follow is a toggle button (aria-pressed) and its result is announced politely; each project is one link with a single tab stop" },
      { keys: "Arrow keys in Work and Activity", action: "Move between the two tabs" },
      { keys: "Motion", action: "Entrances, the count-up and the card glow are skipped when reduced motion is on" },
    ],
    customization: [
      "cover and avatar take a URL or an image with alt text; leave them out for generated art in the theme's chart colors",
      "defaultTab: 'work' | 'activity'; locale formats numbers",
      "Pass real daily counts as activity, one per day in calendar order",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
