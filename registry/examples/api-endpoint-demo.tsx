import { ApiEndpoint } from "@/components/ballmac/api-endpoint"

export default function ApiEndpointDemo() {
  return (
    <div className="w-full max-w-2xl">
      <ApiEndpoint
        method="POST"
        path="/v1/customers/{account_id}/subscriptions"
        baseUrl="https://api.example.com"
        summary="Create a subscription"
        description="Starts a subscription for an existing customer. The first invoice is created immediately unless a trial is set."
        auth="Bearer token"
        parameters={[
          { name: "account_id", in: "path", type: "string", required: true, description: "The customer's account ID." },
          { name: "dry_run", in: "query", type: "boolean", description: "Validate the request without creating anything.", default: "false" },
          { name: "plan", in: "body", type: "string", required: true, description: "Plan identifier, such as team_monthly." },
          { name: "trial_days", in: "body", type: "integer", description: "Free days before the first charge." },
        ]}
        requestExample={`{
  "plan": "team_monthly",
  "trial_days": 14
}`}
        responses={[
          { status: 201, description: "The subscription was created.", example: `{
  "id": "sub_9d2f41",
  "status": "trialing",
  "plan": "team_monthly",
  "trial_end": "2026-10-14T00:00:00Z"
}` },
          { status: 402, description: "The customer has no valid payment method.", example: `{
  "error": {
    "code": "payment_method_required",
    "message": "Add a card before subscribing."
  }
}` },
          { status: 404, description: "No customer with that account ID." },
        ]}
      />
    </div>
  )
}
