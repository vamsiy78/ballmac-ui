import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { PulseButton } from "@/components/ballmac/pulse-button";

afterEach(() => {
  motion.reduce = false;
});

const rings = (c: HTMLElement) => c.querySelectorAll("[data-slot=pulse-button] > span[aria-hidden=true]");

describe("PulseButton", () => {
  it("sends the requested number of decorative rings", () => {
    const { container } = render(<PulseButton rings={3}>Try it</PulseButton>);
    expect(rings(container)).toHaveLength(3);
    expect(container.querySelector("[data-slot=pulse-button]")).toHaveAttribute("data-pulsing");
  });
  it("calms down on hover and keyboard focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<PulseButton>Try it</PulseButton>);
    const root = container.querySelector("[data-slot=pulse-button]")!;
    await user.hover(screen.getByRole("button"));
    expect(root).not.toHaveAttribute("data-pulsing");
    await user.unhover(screen.getByRole("button"));
    expect(root).toHaveAttribute("data-pulsing");
    await user.tab();
    expect(root).not.toHaveAttribute("data-pulsing");
  });
  it("draws no rings when inactive or disabled", () => {
    const { container, rerender } = render(<PulseButton active={false}>Done</PulseButton>);
    expect(rings(container)).toHaveLength(0);
    rerender(<PulseButton disabled>Off</PulseButton>);
    expect(rings(container)).toHaveLength(0);
  });
  it("keeps the rings still under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<PulseButton rings={2}>Still</PulseButton>);
    expect(rings(container)).toHaveLength(2);
  });
});
