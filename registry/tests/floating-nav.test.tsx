import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FloatingNav } from "@/components/ballmac/floating-nav";

const items = [
  { value: "home", label: "Home", href: "#home" },
  { value: "docs", label: "Docs", href: "#docs" },
];

describe("FloatingNav", () => {
  it("marks the active item and moves the mark when another is chosen", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FloatingNav items={items} onValueChange={onValueChange} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("link", { name: "Docs" }));
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
    expect(onValueChange).toHaveBeenCalledWith("docs");
  });
  it("stays controlled and is a labelled landmark", async () => {
    const user = userEvent.setup();
    render(<FloatingNav items={items} value="home" label="Site" />);
    expect(screen.getByRole("navigation", { name: "Site" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Docs" }));
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });
});
