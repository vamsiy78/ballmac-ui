// Ballmac UI: Relay code samples. https://ui.ballmac.com/templates/template-relay
import type { Snippet } from "@/components/ballmac/snippet-tabs"

/** The package the samples install. Kept in a variable so it is documentation, not a dependency of this file. */
const pkg = "@relay/sdk"

/** Sending an event, in four languages. */
export const sendSnippets: Snippet[] = [
  {
    label: "curl",
    language: "bash",
    code: `curl https://api.relay.dev/v1/events \\
  -H "Authorization: Bearer {{key}}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "invoice.paid",
    "endpoint": "ep_billing",
    "data": { "id": "inv_1042", "amount": 4900 }
  }'`,
  },
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { Relay } from ${JSON.stringify(pkg)}

const relay = new Relay("{{key}}")

await relay.events.send({
  type: "invoice.paid",
  endpoint: "ep_billing",
  data: { id: "inv_1042", amount: 4900 },
})`,
  },
  {
    label: "Python",
    language: "python",
    code: `from relay import Relay

relay = Relay("{{key}}")

relay.events.send(
    type="invoice.paid",
    endpoint="ep_billing",
    data={"id": "inv_1042", "amount": 4900},
)`,
  },
  {
    label: "Go",
    language: "go",
    code: `client := relay.New("{{key}}")

_, err := client.Events.Send(ctx, relay.Event{
    Type:     "invoice.paid",
    Endpoint: "ep_billing",
    Data:     map[string]any{"id": "inv_1042", "amount": 4900},
})`,
  },
]

/** Verifying a signature, in four languages. */
export const verifySnippets: Snippet[] = [
  {
    label: "curl",
    language: "bash",
    code: `# Recompute the signature yourself to check a delivery
SIGNED="$TIMESTAMP.$BODY"
printf '%s' "$SIGNED" | openssl dgst -sha256 -hmac "$RELAY_SECRET"
# The result must match the Relay-Signature header`,
  },
  {
    label: "TypeScript",
    language: "typescript",
    code: `import { verify } from ${JSON.stringify(pkg)}

export async function POST(req: Request) {
  const body = await req.text()
  const event = verify(body, req.headers, process.env.RELAY_SECRET!)
  // event.id is stable across retries: use it to dedupe
  return new Response("ok")
}`,
  },
  {
    label: "Python",
    language: "python",
    code: `from relay import verify

@app.post("/webhooks")
def webhook(request):
    event = verify(request.body, request.headers, RELAY_SECRET)
    # event.id is stable across retries: use it to dedupe
    return "ok"`,
  },
  {
    label: "Go",
    language: "go",
    code: `func webhook(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    event, err := relay.Verify(body, r.Header, secret)
    // event.ID is stable across retries: use it to dedupe
    w.WriteHeader(http.StatusOK)
}`,
  },
]
