import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { ShinyButton } from "@/components/ballmac/shiny-button";

afterEach(() => {
  motion.reduce = false;
});

describe("ShinyButton", () => {
  it("acts like a button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ShinyButton onClick={onClick}>Upgrade</ShinyButton>);
    await user.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("adds a decorative sweep, in either mode", () => {
    const { container, rerender } = render(<ShinyButton>Hover</ShinyButton>);
    expect(container.querySelector("[aria-hidden=true]")).toBeInTheDocument();
    rerender(<ShinyButton shine="loop">Loop</ShinyButton>);
    expect(container.querySelector("[aria-hidden=true]")).toBeInTheDocument();
  });
  it("draws no shine under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<ShinyButton>Calm</ShinyButton>);
    expect(container.querySelector("[aria-hidden=true]")).toBeNull();
  });
});
