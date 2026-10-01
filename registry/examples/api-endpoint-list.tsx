import { ApiEndpoint } from "@/components/ballmac/api-endpoint"

export default function ApiEndpointList() {
  return (
    <div className="grid w-full max-w-2xl gap-2.5">
      <ApiEndpoint method="GET" path="/v1/projects" summary="List projects" defaultOpen={false} auth="Bearer token" />
      <ApiEndpoint
        method="GET"
        path="/v1/projects/{id}"
        summary="Retrieve a project"
        defaultOpen={false}
        parameters={[{ name: "id", in: "path", type: "string", required: true, description: "Project ID." }]}
      />
      <ApiEndpoint method="PATCH" path="/v1/projects/{id}" summary="Update a project" defaultOpen={false} />
      <ApiEndpoint method="DELETE" path="/v1/projects/{id}" summary="Delete a project" defaultOpen={false} />
    </div>
  )
}
