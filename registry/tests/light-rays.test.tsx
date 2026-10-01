import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { LightRays } from "@/components/ballmac/light-rays";

afterEach(() => {
  motion.reduce = false;
});

const rays = (c: HTMLElement) => c.querySelectorAll("[data-slot=light-rays] > span.origin-top");

describe("LightRays", () => {
  it("is decorative", () => {
    const { container } = render(<LightRays />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toHaveClass("pointer-events-none");
  });
  it("draws the requested number of rays", () => {
    const { container } = render(<LightRays count={5} />);
    expect(rays(container as HTMLElement)).toHaveLength(5);
  });
  it("is deterministic, so server and browser markup match", () => {
    const a = render(<LightRays count={4} />).container.innerHTML;
    const b = render(<LightRays count={4} />).container.innerHTML;
    expect(a).toBe(b);
  });
  it("uses the tone as the light color", () => {
    const { container } = render(<LightRays tone="chart-3" />);
    expect((container.querySelector("[data-slot=light-rays] > span") as HTMLElement).style.background).toContain("var(--chart-3)");
  });
  it("renders under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<LightRays count={3} />);
    expect(rays(container as HTMLElement)).toHaveLength(3);
  });
});
