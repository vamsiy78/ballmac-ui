import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { ClickRipple, Ripple } from "@/components/ballmac/ripple";

afterEach(() => {
  motion.reduce = false;
});

describe("Ripple", () => {
  it("draws the requested number of decorative rings", () => {
    const { container } = render(<Ripple circles={5} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("[data-slot=ripple] > span")).toHaveLength(5);
  });
});

describe("ClickRipple", () => {
  it("sends a ripple from the pointer and clears it when done", async () => {
    const { container } = render(<ClickRipple>Inbox</ClickRipple>);
    fireEvent.pointerDown(screen.getByText("Inbox"), { clientX: 10, clientY: 10 });
    expect(container.querySelectorAll("[aria-hidden=true] > span").length).toBe(1);
    await waitFor(() => expect(container.querySelectorAll("[aria-hidden=true] > span").length).toBe(0), { timeout: 3000 });
  });
  it("ripples from the center when the wrapper itself is activated from the keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ClickRipple tabIndex={0} role="button">
        Open
      </ClickRipple>
    );
    await user.tab();
    await user.keyboard("{Enter}");
    expect(container.querySelectorAll("[aria-hidden=true] > span").length).toBe(1);
  });
  it("skips ripples under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<ClickRipple>Quiet</ClickRipple>);
    fireEvent.pointerDown(screen.getByText("Quiet"));
    expect(container.querySelectorAll("[aria-hidden=true] > span").length).toBe(0);
  });
});
