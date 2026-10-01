import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { RetroGrid } from "@/components/ballmac/retro-grid";

afterEach(() => {
  motion.reduce = false;
});

describe("RetroGrid", () => {
  it("is decorative and does not catch the pointer", () => {
    const { container } = render(<RetroGrid />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("pointer-events-none");
  });
  it("tilts the floor and sizes the cells", () => {
    const { container } = render(<RetroGrid angle={70} cellSize={80} />);
    const plane = container.querySelector("[data-slot=retro-grid] > div") as HTMLElement;
    expect(plane.style.transform).toBe("rotateX(70deg)");
    const grid = plane.firstElementChild as HTMLElement;
    expect(grid.style.backgroundSize).toBe("80px 80px");
  });
  it("can drop the horizon glow, and renders under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<RetroGrid glow={false} />);
    expect(container.querySelectorAll("[data-slot=retro-grid] > span")).toHaveLength(1);
  });
});
