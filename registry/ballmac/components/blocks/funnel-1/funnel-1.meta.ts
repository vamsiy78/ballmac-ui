import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "funnel-1",
  type: "registry:block",
  title: "Funnel 1: conversion funnel",
  description:
    "A conversion funnel: bars sized against the first step, joined by connectors that narrow as people drop away, with share kept and people lost at each step, the biggest leak written out, a group switch and a panel for any chosen step.",
  category: "blocks",
  blockCategory: "funnel",
  tags: ["funnel", "conversion", "analytics", "drop-off", "checkout", "growth", "steps", "dashboard", "metrics"],
  files: [{ path: "components/blocks/funnel-1/funnel-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "funnel-1-demo", title: "Three groups", file: "funnel-1-demo.tsx" },
    { name: "funnel-1-single", title: "One group, a step chosen", file: "funnel-1-single.tsx" },
    { name: "funnel-1-loading", title: "Loading", file: "funnel-1-loading.tsx" },
    { name: "funnel-1-empty", title: "No data yet", file: "funnel-1-empty.tsx" },
    { name: "funnel-1-error", title: "Could not load", file: "funnel-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "funnel-1-loading", trigger: "state=\"loading\"", note: "Skeleton bars that narrow like the real funnel, under the real heading, announced as loading." },
    { id: "empty", title: "No data yet", example: "funnel-1-empty", trigger: "state=\"empty\" (or segments={[]})", note: "Says the funnel appears once visitors move through the steps; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "funnel-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A conversion funnel. <Funnel1 title description period='Last 30 days' segments={[{ id, label, steps: [{ id, name, count }] }]} locale />. Counts must be people who reached each step, first to last. Share of the first step, share kept from the step before, people lost, overall conversion and the biggest leak (the largest proportional drop) are worked out. A segment switch shows when there are two or more groups.",
    whenToUse: ["Analytics for signup, onboarding or checkout flows", "Showing where a growth experiment should focus"],
    whenNotToUse: ["Results of an A/B test (use experiments-1)", "Trends over time (use a chart)"],
    composesWith: ["experiments-1", "app-shell-1", "dashboard-1"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Each step is a button that says its count, its share of the first step and of the step before; pressing it shows the same in a panel announced politely" },
      { keys: "Loss", action: "Written as 'N lost · 38%' beside the connector, and the biggest leak is a full sentence, not only a red outline" },
      { keys: "Group", action: "A labelled switch between groups, such as Everyone, Mobile and Desktop" },
    ],
    customization: ["Bars use two theme colors blended by step", "A step narrower than 6% of the first is drawn at 6% so it stays visible; its true share is written beside it", "Connectors mirror in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
