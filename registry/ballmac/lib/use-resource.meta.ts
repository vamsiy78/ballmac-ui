import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "use-resource",
  type: "registry:lib",
  title: "Use Resource",
  description: "A small fetch state machine that gives every block the state to show: loading, ready, empty or error, with retry, abort and stale-answer protection. Includes an adapter for TanStack Query and SWR.",
  category: "foundation",
  tags: ["state", "loading", "empty", "error", "fetch", "hook", "swr", "tanstack"],
  files: [{ path: "lib/use-resource.ts" }],
  dependencies: [],
  ai: {
    summary: "useResource(fetcher) returns { state, data, error, retry, setData }. Pass state, data and onRetry to any Ballmac block that has a state prop. stateOf(query) maps TanStack Query or SWR results onto the same states. BlockState is the shared type.",
    whenToUse: ["Wiring a block's loading, empty and error states to a fetch", "Mapping TanStack Query or SWR results onto a block's state prop"],
    whenNotToUse: ["Server components that fetch before render: pass the data and let the block render ready or empty", "Mutations: forms track submitting and success themselves"],
    composesWith: ["state-view"],
    customization: ["isEmpty: decide what counts as no data", "enabled: wait until you can fetch", "deps: fetch again when they change", "setData: update the data after an optimistic edit"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds FormStateProps and formPhase, the shared state contract for form blocks (submitting, success, error)." },
    { version: "1.0.0", date: "2026-10-12", note: "First release." },
  ],
})
