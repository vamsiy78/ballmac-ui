import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { ScrollVelocity } from "@/components/ballmac/scroll-velocity";

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, value: 300 });
});
afterEach(() => {
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetWidth;
  motion.reduce = false;
});

describe("ScrollVelocity", () => {
  it("repeats its content to fill the row and hides the repeats", () => {
    const { container } = render(
      <ScrollVelocity>
        <span>Design</span>
      </ScrollVelocity>
    );
    const copies = container.querySelectorAll("[data-slot=scroll-velocity] .shrink-0");
    expect(copies.length).toBeGreaterThanOrEqual(3);
    expect(copies[0]).not.toHaveAttribute("aria-hidden");
    for (const copy of Array.from(copies).slice(1)) {
      expect(copy).toHaveAttribute("aria-hidden", "true");
      expect(copy).toHaveAttribute("inert");
    }
    expect(screen.getAllByText("Design")[0]).toBeInTheDocument();
  });
  it("keeps focusable repeats out of the tab order", () => {
    const { container } = render(
      <ScrollVelocity>
        <a href="#x">Link</a>
      </ScrollVelocity>
    );
    const inert = container.querySelectorAll("[inert] a");
    expect(inert.length).toBeGreaterThan(0);
  });
  it("shows one scrollable row, with no repeats, under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(
      <ScrollVelocity>
        <span>Still</span>
      </ScrollVelocity>
    );
    expect(container.querySelectorAll("[inert]")).toHaveLength(0);
    expect(container.firstElementChild).toHaveClass("overflow-x-auto");
    expect(screen.getAllByText("Still")).toHaveLength(1);
  });
});
