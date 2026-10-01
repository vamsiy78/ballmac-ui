import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RainbowButton } from "@/components/ballmac/rainbow-button";

describe("RainbowButton", () => {
  it("is a normal button that can be clicked and focused", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<RainbowButton onClick={onClick}>Get started</RainbowButton>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Get started" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<RainbowButton disabled onClick={onClick}>Nope</RainbowButton>);
    await user.click(screen.getByRole("button", { name: "Nope" }));
    expect(onClick).not.toHaveBeenCalled();
  });
  it("keeps the border and glow decorative", () => {
    const { container } = render(<RainbowButton shape="pill">Pill</RainbowButton>);
    expect(container.querySelectorAll("[aria-hidden=true]").length).toBe(2);
    expect(container.querySelector("[data-slot=rainbow-button]")).toHaveClass("rounded-full");
  });
});
