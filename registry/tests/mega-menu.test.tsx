import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MegaMenu, MegaMenuMobileList, type MegaMenuItem } from "@/components/ballmac/mega-menu";

const items: MegaMenuItem[] = [
  {
    label: "Product",
    columns: [{ title: "Build", links: [{ title: "Workspaces", href: "/w", description: "Projects and files", badge: "New" }] }],
    featured: { title: "What's new", description: "Latest releases", href: "/changelog", cta: "Read more" },
  },
  { label: "Pricing", href: "/pricing" },
];

describe("MegaMenu", () => {
  it("opens a panel with the keyboard and shows grouped links and the featured card", async () => {
    const user = userEvent.setup();
    render(<MegaMenu items={items} label="Main" />);
    const trigger = screen.getByRole("button", { name: "Product" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("link", { name: /Workspaces/ })).toHaveAttribute("href", "/w");
    expect(screen.getByText("Build")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /What's new/ })).toHaveAttribute("href", "/changelog");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
  it("renders plain links and a mobile list with native disclosures", () => {
    render(
      <>
        <MegaMenu items={items} />
        <MegaMenuMobileList items={items} />
      </>,
    );
    expect(screen.getAllByRole("link", { name: "Pricing" })).toHaveLength(2);
    expect(document.querySelector("details summary")).toHaveTextContent("Product");
  });
});
