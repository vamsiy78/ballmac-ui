import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ballmac/item";

describe("Item", () => {
  it("renders content and can style a link through asChild", () => {
    render(
      <ItemGroup>
        <Item asChild variant="outline" size="sm">
          <a href="/billing">
            <ItemContent>
              <ItemTitle>Billing</ItemTitle>
              <ItemDescription>Invoices and plans</ItemDescription>
            </ItemContent>
          </a>
        </Item>
      </ItemGroup>,
    );
    const link = screen.getByRole("link", { name: /Billing/ });
    expect(link).toHaveAttribute("href", "/billing");
    expect(link).toHaveAttribute("data-variant", "outline");
    expect(link).toHaveAttribute("data-size", "sm");
  });
});
