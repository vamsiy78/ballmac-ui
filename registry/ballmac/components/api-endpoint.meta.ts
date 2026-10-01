import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "api-endpoint",
  type: "registry:ui",
  title: "API Endpoint",
  description:
    "An endpoint reference card: method and path with highlighted parameters, auth, grouped parameter lists, and request and response examples in tabs with copy.",
  category: "developer",
  tags: ["api", "endpoint", "docs", "rest", "reference"],
  files: [{ path: "components/api-endpoint.tsx" }],
  dependencies: ["lucide-react", "radix-ui"],
  registryDependencies: ["shadcn:utils", "copy-button", "highlight"],
  examples: [
    { name: "api-endpoint-demo", title: "Create a customer", file: "api-endpoint-demo.tsx" },
    { name: "api-endpoint-list", title: "A stack of endpoints", file: "api-endpoint-list.tsx" },
  ],
  ai: {
    summary:
      "method, path (use {id} for path parameters), summary, description, auth, parameters [{ name, in, type, required, description }], requestExample and responses [{ status, description, example }]. Collapsible; copies the full URL when baseUrl is set.",
    whenToUse: ["Hand-written API reference pages", "Internal docs for a small API"],
    whenNotToUse: ["Generating a full OpenAPI portal (render from the spec with your own loop over this component)"],
    composesWith: ["snippet-tabs", "code-block", "json-viewer"],
    a11y: [
      { keys: "Enter / Space", action: "Opens or closes the card" },
      { keys: "ArrowLeft / ArrowRight", action: "Moves between Request and response tabs" },
      { keys: "Screen readers", action: "Parameters are grouped lists; each example is a labelled region; status tabs say Success or error class" },
    ],
    customization: ["defaultOpen / open", "baseUrl", "auth", "per-response language"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
