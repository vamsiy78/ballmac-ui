import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { NeonCard } from "@/components/ballmac/neon-card";

afterEach(() => {
  motion.reduce = false;
});

describe("NeonCard", () => {
  it("renders its content on the normal card surface", () => {
    render(<NeonCard>Pro plan</NeonCard>);
    expect(screen.getByText("Pro plan").closest(".bg-card")).not.toBeNull();
  });
  it("draws the border from the two theme colors", () => {
    const { container } = render(<NeonCard from="chart-2" to="destructive">x</NeonCard>);
    const border = container.querySelector("[data-slot=neon-card] > div") as HTMLElement;
    expect(border.style.background).toContain("var(--chart-2)");
    expect(border.style.background).toContain("var(--destructive)");
  });
  it("sets the border width and radius", () => {
    const { container } = render(<NeonCard borderWidth={3} radius="3xl">x</NeonCard>);
    const card = container.querySelector("[data-slot=neon-card]") as HTMLElement;
    expect(card.style.getPropertyValue("--nw")).toBe("3px");
    expect(card).toHaveClass("rounded-3xl");
  });
  it("keeps the light decorative", () => {
    const { container } = render(<NeonCard flicker>x</NeonCard>);
    expect(container.querySelectorAll("[aria-hidden=true]").length).toBeGreaterThanOrEqual(2);
  });
  it("renders under reduced motion with flicker requested", () => {
    motion.reduce = true;
    render(<NeonCard flicker>Calm</NeonCard>);
    expect(screen.getByText("Calm")).toBeInTheDocument();
  });
});
