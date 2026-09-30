import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Navbar, NavbarBrand, NavbarLink, NavbarLinks, NavbarMobileLink, NavbarMobileMenu } from "@/components/ballmac/navbar";

function setup() {
  return render(
    <Navbar>
      <NavbarBrand href="/">Acme</NavbarBrand>
      <NavbarLinks label="Main">
        <NavbarLink href="/pricing" active>Pricing</NavbarLink>
        <NavbarLink href="/docs">Docs</NavbarLink>
      </NavbarLinks>
      <NavbarMobileMenu label="Menu">
        <NavbarMobileLink href="/pricing">Pricing</NavbarMobileLink>
      </NavbarMobileMenu>
    </Navbar>,
  );
}

describe("Navbar", () => {
  it("renders a labelled navigation with the current page marked", () => {
    setup();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("aria-current");
  });
  it("opens the mobile menu as a dialog and closes it when a link is chosen", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = await screen.findByRole("dialog", { name: "Menu" });
    const link = Array.from(dialog.querySelectorAll("a")).find((a) => a.textContent === "Pricing")!;
    link.addEventListener("click", (e) => e.preventDefault());
    await user.click(link);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
  it("adds a scrolled state after the page moves", async () => {
    const { container } = setup();
    const header = container.querySelector("header")!;
    expect(header).not.toHaveAttribute("data-scrolled");
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    await waitFor(() => expect(header).toHaveAttribute("data-scrolled"));
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });
});
