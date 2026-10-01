// Ballmac UI: Docs template data. https://ui.ballmac.com/templates/template-docs
export type DocsKind = "Guide" | "API" | "Changelog"

export type DocsEntry = { title: string; kind: DocsKind; path: string; summary: string; page: "guide" | "reference" | "changelog" }

/** Everything the search page and the command menu can find. */
export const searchIndex: DocsEntry[] = [
  { title: "Send your first message", kind: "Guide", path: "Get started", summary: "Install the SDK, create a queue, send a message and acknowledge it in about seven minutes.", page: "guide" },
  { title: "Delivery guarantees", kind: "Guide", path: "Concepts", summary: "At-least-once delivery, visibility timeouts and how a message is retried before it reaches the dead-letter queue.", page: "guide" },
  { title: "Dead-letter queues", kind: "Guide", path: "Concepts", summary: "Park messages that keep failing, inspect them and replay them back into the queue once the bug is fixed.", page: "guide" },
  { title: "Idempotent consumers", kind: "Guide", path: "Guides", summary: "Use the message id as an idempotency key so a retried message never charges a card twice.", page: "guide" },
  { title: "Scheduling and delays", kind: "Guide", path: "Guides", summary: "Deliver a message in thirty seconds or next Tuesday with delay and a cron-style schedule.", page: "guide" },
  { title: "Verify webhook signatures", kind: "Guide", path: "Guides", summary: "Check the Tern-Signature header with an HMAC before you trust a push delivery.", page: "guide" },
  { title: "Create a queue", kind: "API", path: "POST /v1/queues", summary: "Creates a queue with a name, a visibility timeout and an optional dead-letter target.", page: "reference" },
  { title: "List queues", kind: "API", path: "GET /v1/queues", summary: "Returns every queue in the project, newest first, with a cursor for the next page.", page: "reference" },
  { title: "Send a message", kind: "API", path: "POST /v1/queues/{queue}/messages", summary: "Adds a message to a queue. Pass an idempotency key to make retries safe.", page: "reference" },
  { title: "Receive messages", kind: "API", path: "GET /v1/queues/{queue}/messages", summary: "Long-polls a queue and hides each message from other consumers until its visibility timeout ends.", page: "reference" },
  { title: "Acknowledge a message", kind: "API", path: "DELETE /v1/queues/{queue}/messages/{id}", summary: "Deletes a message once it has been processed successfully.", page: "reference" },
  { title: "Purge a queue", kind: "API", path: "POST /v1/queues/{queue}/purge", summary: "Removes every waiting message. This cannot be undone.", page: "reference" },
  { title: "3.2: Message replay", kind: "Changelog", path: "September 2026", summary: "Replay any window of the last 14 days into a queue without touching producers.", page: "changelog" },
  { title: "3.1: Batch receive", kind: "Changelog", path: "August 2026", summary: "Receive up to 50 messages per call and acknowledge them in one request.", page: "changelog" },
  { title: "3.0: Regions", kind: "Changelog", path: "June 2026", summary: "Queues can now live in Frankfurt, Virginia or Singapore. Breaking: the default region is explicit.", page: "changelog" },
]

export type NavSection = { title: string; items: { title: string; page: "guide" | "reference" | "changelog"; current?: boolean }[] }

export const nav: NavSection[] = [
  { title: "Get started", items: [{ title: "Send your first message", page: "guide", current: true }, { title: "Core concepts", page: "guide" }, { title: "Authentication", page: "reference" }] },
  { title: "Concepts", items: [{ title: "Delivery guarantees", page: "guide" }, { title: "Visibility timeouts", page: "guide" }, { title: "Dead-letter queues", page: "guide" }] },
  { title: "Guides", items: [{ title: "Idempotent consumers", page: "guide" }, { title: "Scheduling and delays", page: "guide" }, { title: "Verify webhook signatures", page: "guide" }, { title: "Going to production", page: "guide" }] },
  { title: "API reference", items: [{ title: "Queues", page: "reference", current: true }, { title: "Messages", page: "reference" }, { title: "Errors and limits", page: "reference" }] },
  { title: "Releases", items: [{ title: "Changelog", page: "changelog", current: true }] },
]

export type Release = { version: string; date: string; title: string; tag: "Added" | "Improved" | "Fixed" | "Breaking"; body: string; points: string[] }

export const releases: Release[] = [
  { version: "3.2.0", date: "2026-09-24", title: "Message replay", tag: "Added", body: "Replay a window of past messages into any queue. Useful after a bad deploy, or to seed a new environment with real traffic.", points: ["Replay up to 14 days of history by time range or by message id", "Replays are rate limited per queue so they never starve live traffic", "New `tern replay` command and `POST /v1/queues/{queue}/replays`"] },
  { version: "3.1.4", date: "2026-09-10", title: "Faster long polling", tag: "Improved", body: "Receive calls now wake within 40 ms of a message arriving instead of waiting for the next poll tick.", points: ["Median receive latency fell from 180 ms to 46 ms", "No change needed: the improvement applies to every SDK"] },
  { version: "3.1.3", date: "2026-08-29", title: "Visibility timeout on batch receive", tag: "Fixed", body: "Messages received in a batch of 50 could become visible again early if the first acknowledgement was slow.", points: ["The visibility timer now starts per message, not per batch", "Affected SDKs: node 3.1.0 to 3.1.2, python 3.1.0 to 3.1.1"] },
  { version: "3.1.0", date: "2026-08-12", title: "Batch receive and acknowledge", tag: "Added", body: "Receive up to 50 messages per call and acknowledge them in a single request. Throughput on busy queues roughly doubles.", points: ["`maxMessages` on receive, `ids` on acknowledge", "Partial failures return a per-message result", "SDK helpers `queue.consume()` batch for you"] },
  { version: "3.0.0", date: "2026-06-03", title: "Regions are explicit", tag: "Breaking", body: "Queues now live in a region you choose. The old global endpoint is retired, so clients must set a region.", points: ["Set `region` when creating the client: `eu`, `us` or `ap`", "Existing queues were migrated to `us` with no downtime", "The global endpoint returns 410 on 1 December 2026"] },
  { version: "2.9.2", date: "2026-05-14", title: "Clearer error messages", tag: "Improved", body: "Every error now includes a stable `code`, a human sentence and a link to the page that explains the fix.", points: ["`queue_not_found`, `visibility_expired` and 14 more codes documented", "Errors in the dashboard link straight to the docs"] },
]

export const languages = ["Node", "Python", "Go", "cURL"] as const

export const endpointGroups = [
  {
    title: "Queues",
    endpoints: [
      {
        method: "POST" as const, path: "/v1/queues", summary: "Create a queue", description: "Creates a queue in the region of the client. Names are unique per project.",
        parameters: [
          { name: "name", in: "body" as const, type: "string", required: true, description: "Lowercase letters, numbers and dashes, up to 64 characters." },
          { name: "visibilityTimeout", in: "body" as const, type: "integer", description: "Seconds a received message stays hidden.", default: "30" },
          { name: "deadLetter", in: "body" as const, type: "string", description: "Name of the queue that receives messages after maxReceives failures." },
          { name: "maxReceives", in: "body" as const, type: "integer", description: "Receives before a message is moved to the dead-letter queue.", default: "5" },
        ],
        requestExample: `{\n  "name": "invoices",\n  "visibilityTimeout": 60,\n  "deadLetter": "invoices-dead",\n  "maxReceives": 5\n}`,
        responses: [
          { status: 201, description: "Queue created", example: `{\n  "name": "invoices",\n  "region": "eu",\n  "visibilityTimeout": 60,\n  "createdAt": "2026-09-30T08:14:22Z"\n}` },
          { status: 409, description: "A queue with this name already exists", example: `{\n  "code": "queue_exists",\n  "message": "A queue named invoices already exists in eu."\n}` },
        ],
      },
      {
        method: "GET" as const, path: "/v1/queues", summary: "List queues", description: "Returns the queues in the project, newest first.",
        parameters: [
          { name: "limit", in: "query" as const, type: "integer", description: "Queues per page, up to 100.", default: "25" },
          { name: "cursor", in: "query" as const, type: "string", description: "The `next` value from the previous page." },
        ],
        responses: [{ status: 200, description: "A page of queues", example: `{\n  "data": [{ "name": "invoices", "waiting": 12, "inFlight": 3 }],\n  "next": null\n}` }],
      },
      {
        method: "POST" as const, path: "/v1/queues/{queue}/purge", summary: "Purge a queue", description: "Removes every waiting message. In-flight messages finish normally. This cannot be undone.",
        parameters: [{ name: "queue", in: "path" as const, type: "string", required: true, description: "The queue name." }],
        responses: [{ status: 202, description: "Purge accepted", example: `{ "removed": 1204 }` }, { status: 404, description: "No such queue", example: `{ "code": "queue_not_found" }` }],
      },
    ],
  },
  {
    title: "Messages",
    endpoints: [
      {
        method: "POST" as const, path: "/v1/queues/{queue}/messages", summary: "Send a message", description: "Adds a message to the queue. Send an `Idempotency-Key` header and a retry will return the first result instead of adding a duplicate.",
        parameters: [
          { name: "queue", in: "path" as const, type: "string", required: true, description: "The queue name." },
          { name: "Idempotency-Key", in: "header" as const, type: "string", description: "Any string up to 255 characters. Keys expire after 24 hours." },
          { name: "body", in: "body" as const, type: "object", required: true, description: "Any JSON up to 256 KB." },
          { name: "delay", in: "body" as const, type: "integer", description: "Seconds before the message becomes visible, up to 15 minutes.", default: "0" },
        ],
        requestExample: `{\n  "body": { "invoice": "inv_2041", "total": 4200 },\n  "delay": 0\n}`,
        responses: [{ status: 201, description: "Message accepted", example: `{\n  "id": "msg_7Hq2Zc",\n  "queue": "invoices",\n  "visibleAt": "2026-09-30T08:14:22Z"\n}` }, { status: 413, description: "Body is larger than 256 KB", example: `{ "code": "body_too_large" }` }],
      },
      {
        method: "GET" as const, path: "/v1/queues/{queue}/messages", summary: "Receive messages", description: "Long-polls for up to `wait` seconds. Each message is hidden from other consumers until its visibility timeout ends.",
        parameters: [
          { name: "queue", in: "path" as const, type: "string", required: true, description: "The queue name." },
          { name: "maxMessages", in: "query" as const, type: "integer", description: "Up to 50 per call.", default: "1" },
          { name: "wait", in: "query" as const, type: "integer", description: "Seconds to wait for a message, up to 20.", default: "0" },
        ],
        responses: [{ status: 200, description: "Zero or more messages", example: `{\n  "data": [\n    { "id": "msg_7Hq2Zc", "receipt": "rcpt_91", "body": { "invoice": "inv_2041" }, "receives": 1 }\n  ]\n}` }],
      },
      {
        method: "DELETE" as const, path: "/v1/queues/{queue}/messages/{id}", summary: "Acknowledge a message", description: "Deletes a message once it has been processed. Use the receipt from the receive call.",
        parameters: [
          { name: "queue", in: "path" as const, type: "string", required: true, description: "The queue name." },
          { name: "id", in: "path" as const, type: "string", required: true, description: "The message id." },
          { name: "receipt", in: "query" as const, type: "string", required: true, description: "Proves you hold the message right now." },
        ],
        responses: [{ status: 204, description: "Deleted" }, { status: 410, description: "The visibility timeout ended; the message may already be with another consumer", example: `{ "code": "visibility_expired" }` }],
      },
    ],
  },
]

export const snippets = {
  install: { Node: "npm install @tern/sdk", Python: "pip install tern", Go: "go get github.com/tern/tern-go", cURL: "# nothing to install" },
}
