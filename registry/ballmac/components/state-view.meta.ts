import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "state-view",
  type: "registry:ui",
  title: "State View",
  description:
    "Shows the right thing for what the data is doing: a skeleton while loading, a helpful empty state, an error with retry, or your content. Announced to screen readers, never steals focus, fades with the theme's motion.",
  category: "feedback",
  tags: ["state", "loading", "empty", "error", "skeleton", "retry", "boundary", "async"],
  files: [{ path: "components/state-view.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "empty", "skeleton", "i18n", "use-resource"],
  examples: [
    { name: "state-view-demo", title: "Every state", file: "state-view-demo.tsx" },
    { name: "state-view-resource", title: "With a real fetch", file: "state-view-resource.tsx" },
  ],
  ai: {
    summary:
      "Wrap any data view: <StateView state={state} loading={<MySkeleton/>} empty={{ title, description, action }} error={{ title, description, details }} onRetry={retry}>{ready content}</StateView>. Pair with useResource, which returns the state. Loading is announced and the region is aria-busy; errors use role=alert; focus is never moved.",
    whenToUse: [
      "Any list, table, feed or panel that loads data",
      "Giving a block its loading, empty and error views without writing them each time",
    ],
    whenNotToUse: ["Forms: they track submitting and success themselves (blocks with a state prop handle it)", "A single value that is just a number: use a skeleton line"],
    composesWith: ["use-resource", "empty", "skeleton", "button"],
    a11y: [
      { keys: "Screen reader", action: "Loading is announced as a status; an error is announced as an alert; the region is aria-busy while loading" },
      { keys: "Tab", action: "Reaches the retry button and the details disclosure; focus is never moved for you" },
    ],
    customization: [
      "loading: pass a skeleton shaped like your content so nothing jumps",
      "empty and error: a config object ({ title, description, icon, action } and { title, description, details, retryLabel, action }) or your own node",
      "onRetry: draws the retry button",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-12",
})
