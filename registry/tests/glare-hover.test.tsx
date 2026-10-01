import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { GlareHover } from "@/components/ballmac/glare-hover";

afterEach(() => {
  motion.reduce = false;
});

describe("GlareHover", () => {
  it("wraps content and adds a decorative sweep", () => {
    const { container } = render(<GlareHover>Poster</GlareHover>);
    expect(screen.getByText("Poster")).toBeInTheDocument();
    expect(container.querySelector("[aria-hidden=true]")).toHaveClass("pointer-events-none");
  });
  it("uses the angle, duration and tone", () => {
    const { container } = render(<GlareHover angle={30} duration={1200} tone="dark">x</GlareHover>);
    const root = container.querySelector("[data-slot=glare-hover]") as HTMLElement;
    expect(root.style.getPropertyValue("--glare-ms")).toBe("1200ms");
    const band = container.querySelector("[aria-hidden=true] > span") as HTMLElement;
    expect(band.style.transform).toBe("skewX(-30deg)");
    expect(band.style.background).toContain("var(--foreground)");
  });
  it("draws no glare under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<GlareHover>x</GlareHover>);
    expect(container.querySelector("[aria-hidden=true]")).toBeNull();
  });
});
