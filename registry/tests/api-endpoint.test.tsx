import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ApiEndpoint } from "@/components/ballmac/api-endpoint";

const props = {
  method: "POST" as const,
  path: "/v1/customers/{id}/subs",
  summary: "Create a subscription",
  baseUrl: "https://api.example.com/",
  auth: "Bearer token",
  parameters: [
    { name: "id", in: "path" as const, type: "string", required: true, description: "Customer ID" },
    { name: "plan", in: "body" as const, type: "string", description: "Plan", default: "team" },
  ],
  requestExample: '{ "plan": "team" }',
  responses: [
    { status: 201, description: "Created", example: '{ "id": "sub_1" }' },
    { status: 404, description: "No such customer" },
  ],
};

describe("ApiEndpoint", () => {
  it("lists grouped parameters with required and default markers", () => {
    render(<ApiEndpoint {...props} />);
    expect(screen.getByRole("region", { name: "path parameters" })).toHaveTextContent("required");
    expect(screen.getByRole("region", { name: "body parameters" })).toHaveTextContent("Default: team");
  });
  it("collapses and expands from its header", async () => {
    const user = userEvent.setup();
    render(<ApiEndpoint {...props} />);
    const header = screen.getByRole("button", { name: /^POST/ });
    expect(header).toHaveAttribute("aria-expanded", "true");
    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
  });
  it("switches between request and responses with the keyboard", async () => {
    const user = userEvent.setup();
    render(<ApiEndpoint {...props} />);
    expect(screen.getByRole("region", { name: "request body" })).toHaveTextContent('"plan"');
    screen.getByRole("tab", { name: "Request" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "201" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("region", { name: "201 response body" })).toHaveTextContent("sub_1");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Client error.")).toBeInTheDocument();
  });
  it("copies the full URL", async () => {
    const user = userEvent.setup();
    render(<ApiEndpoint {...props} />);
    await user.click(screen.getByRole("button", { name: "Copy URL for POST /v1/customers/{id}/subs" }));
    expect(await navigator.clipboard.readText()).toBe("https://api.example.com/v1/customers/{id}/subs");
  });
});
