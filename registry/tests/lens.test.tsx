import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Lens } from "@/components/ballmac/lens";

// jsdom has no layout, so give elements a size for the lens to work with.
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, value: 300 });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, value: 200 });
});
afterEach(() => {
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetWidth;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetHeight;
});

const lensEl = (c: HTMLElement) => c.querySelector("[data-slot=lens] > div[aria-hidden=true]");

describe("Lens", () => {
  it("is a focusable, named group that explains the keys", () => {
    render(
      <Lens label="Route map">
        <p>Map</p>
      </Lens>
    );
    const group = screen.getByRole("group");
    expect(group).toHaveAccessibleName(/Route map\. Move the pointer over it, or use the arrow keys/);
    expect(group).toHaveAttribute("tabindex", "0");
  });
  it("shows the lens when the pointer moves, with an inert hidden copy, and hides it on leave", () => {
    const { container } = render(
      <Lens>
        <button type="button">Inside</button>
      </Lens>
    );
    const group = screen.getByRole("group");
    expect(lensEl(container)).toBeNull();
    fireEvent.pointerMove(group, { clientX: 20, clientY: 20, pointerType: "mouse" });
    const lens = lensEl(container);
    expect(lens).not.toBeNull();
    expect(lens!.querySelector("[inert]")).not.toBeNull();
    fireEvent.pointerLeave(group);
    expect(lensEl(container)).toBeNull();
  });
  it("ignores touch so scrolling still works", () => {
    const { container } = render(<Lens>x</Lens>);
    fireEvent.pointerMove(screen.getByRole("group"), { clientX: 5, clientY: 5, pointerType: "touch" });
    expect(lensEl(container)).toBeNull();
  });
  it("moves with the arrow keys and hides on Escape", async () => {
    const user = userEvent.setup();
    const { container } = render(<Lens>x</Lens>);
    screen.getByRole("group").focus();
    await user.keyboard("{ArrowRight}");
    expect(lensEl(container)).not.toBeNull();
    await user.keyboard("{Escape}");
    expect(lensEl(container)).toBeNull();
  });
});
