import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "matrix-1",
  type: "registry:block",
  title: "Matrix 1: service health by region",
  description:
    "Service health by region: 30-day availability for every service in every region as a heat grid, each cell good, warning or problem in words and an icon, what is below the line listed, the last incident per cell and a team filter.",
  category: "blocks",
  blockCategory: "matrix",
  tags: ["service health", "availability", "regions", "heatmap", "uptime", "sre", "status", "reliability"],
  files: [{ path: "components/blocks/matrix-1/matrix-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "heat-grid", "skeleton", "state-view"],
  examples: [
    { name: "matrix-1-demo", title: "Default", file: "matrix-1-demo.tsx" },
    { name: "matrix-1-ai", title: "One team", file: "matrix-1-ai.tsx" },
    { name: "matrix-1-loading", title: "Loading", file: "matrix-1-loading.tsx" },
    { name: "matrix-1-empty", title: "No services yet", file: "matrix-1-empty.tsx" },
    { name: "matrix-1-error", title: "Could not load", file: "matrix-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "matrix-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the grid and the detail under the real heading, announced as loading." },
    { id: "empty", title: "No services yet", example: "matrix-1-empty", trigger: "state=\"empty\"", note: "Says no services yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "matrix-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Service health by region. <Matrix1 services={[{ id, name, team }]} regions={[{ id, label }]} availability={[[99.99, 99.8, null], ...]} incidents={{ 'pay:eu': { when, summary } }} goodFrom={99.9} warnBelow={99} onOpenRunbook={(serviceId, regionId) => void} />. Built on heat-grid with tone. Cells at or above goodFrom are good, below warnBelow are problems; null means the service does not run there.",
    whenToUse: ["A reliability overview across services and regions", "A status board for an engineering team"],
    whenNotToUse: ["A public status page; use status-1", "Error budgets over time; use slo-1"],
    composesWith: ["slo-1", "incident-1", "runbook-1", "status-1"],
    a11y: [
      { keys: "Grid", action: "An ARIA grid with row and column headers; Tab enters once and the arrow keys, Home and End move between cells" },
      { keys: "Cells", action: "Each reads 'Payments, Europe: 99.82%, Warning'; tone adds an icon and a word, never colour alone" },
      { keys: "Summary", action: "What is below the line is written as a sentence in a polite live region" },
      { keys: "Detail", action: "The chosen cell's last incident and an Open runbook button" },
    ],
    customization: ["services, regions and availability", "goodFrom and warnBelow", "incidents keyed 'serviceId:regionId'", "onOpenRunbook"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
