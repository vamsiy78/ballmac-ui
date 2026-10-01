import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { GridPattern } from "@/components/ballmac/grid-pattern";

afterEach(() => {
  motion.reduce = false;
});

describe("GridPattern", () => {
  it("draws one pattern of the requested size and hides from assistive tech", () => {
    const { container } = render(<GridPattern cell={48} strokeDasharray="4 3" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    const pattern = container.querySelector("pattern")!;
    expect(pattern).toHaveAttribute("width", "48");
    expect(pattern.querySelector("path")).toHaveAttribute("stroke-dasharray", "4 3");
  });
  it("fills the cells it is told to", () => {
    const { container } = render(<GridPattern squares={[[1, 1], [2, 3]]} />);
    expect(container.querySelectorAll("svg > rect")).toHaveLength(3);
  });
  it("picks random cells only after mount", async () => {
    const { container } = render(<GridPattern flicker={4} />);
    await waitFor(() => expect(container.querySelectorAll("svg > rect").length).toBe(5));
  });
  it("lights nothing under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<GridPattern flicker={4} />);
    expect(container.querySelectorAll("svg > rect")).toHaveLength(1);
  });
  it("uses the chosen edge fade", () => {
    const { container } = render(<GridPattern fade="top" />);
    expect((container.querySelector("svg") as SVGElement).style.maskImage).toContain("to bottom");
  });
});
