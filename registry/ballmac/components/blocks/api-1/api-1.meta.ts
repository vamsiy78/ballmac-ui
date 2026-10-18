import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "api-1",
  type: "registry:block",
  title: "API 1: request explorer",
  description:
    "An API explorer: a method, an address, headers and a JSON body, then the answer with its status in words, time and size and the body as a tree; a broken body is caught before sending, with history and Copy as cURL.",
  category: "blocks",
  blockCategory: "api",
  tags: ["api", "request", "http", "rest", "postman", "playground", "curl", "developer", "docs", "explorer", "json"],
  files: [{ path: "components/blocks/api-1/api-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "copy-button", "input", "json-viewer", "select", "skeleton", "state-view", "textarea"],
  examples: [
    { name: "api-1-demo", title: "Ready to send", file: "api-1-demo.tsx" },
    { name: "api-1-created", title: "A POST answered 201", file: "api-1-created.tsx" },
    { name: "api-1-notfound", title: "An error answer", file: "api-1-notfound.tsx" },
    { name: "api-1-loading", title: "Loading", file: "api-1-loading.tsx" },
    { name: "api-1-error", title: "Could not load", file: "api-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "api-1-loading", trigger: "state=\"loading\"", note: "A skeleton request bar and panel under the real heading, announced as loading. While a request is in flight the response panel shows a skeleton and the page is marked busy." },
    { id: "error", title: "Could not load", example: "api-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry). A request that gets no answer shows 'No response' with the reason in the response panel." },
  ],
  ai: {
    summary:
      "An API explorer. <Api1 title defaultRequest={{ method: 'POST', url, headers: [{ id, key, value }], body }} defaultResponse onSend={(request) => Promise<{ status, statusText, ms, headers, body }>} />. Send is disabled while the address is not a full https URL or a body is not valid JSON, and says why. Every send is added to a history of six. Copy as cURL builds the command from the current request. Without onSend a built-in demo API for /v1/users answers (401 without an Authorization header, 200, 201, 404, 422).",
    whenToUse: ["API documentation with a try-it panel", "A developer dashboard where customers test their keys"],
    whenNotToUse: ["Showing one endpoint's reference (use api-endpoint)", "Watching live traffic (use log-stream)"],
    composesWith: ["dev-1", "webhooks-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, Enter", action: "Method menu, address, then Send; pressing Enter in the address sends. Header rows are labelled by position and each has a Remove button" },
      { keys: "Validation", action: "A bad address or broken JSON is an alert that says what is wrong and why Send is off" },
      { keys: "Response", action: "The panel is a polite live region that reads the status in words, such as '404 Not Found', with time and size" },
    ],
    customization: ["Addresses, headers and bodies are shown left to right in right-to-left layouts, like code", "History restores a past request into the form", "Methods without a body (GET, DELETE) hide the body field and say so"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
