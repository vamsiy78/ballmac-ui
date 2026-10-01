import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { MorphingText } from "@/components/ballmac/morphing-text";

afterEach(() => {
  motion.reduce = false;
});

describe("MorphingText", () => {
  it("lists every text once for screen readers and reserves width with hidden copies", () => {
    const { container } = render(<MorphingText texts={["Design", "Build", "Ship"]} />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Design, Build, Ship");
    expect(container.querySelectorAll(".invisible")).toHaveLength(3);
  });
  it("starts on the first text and applies the threshold filter", () => {
    const { container } = render(<MorphingText texts={["Design", "Build"]} />);
    const layers = container.querySelectorAll("span[aria-hidden=true]:not(.invisible)");
    expect(layers[0]).toHaveTextContent("Design");
    const root = container.querySelector("[data-slot=morphing-text]") as HTMLElement;
    expect(root.style.filter).toMatch(/url\(#/);
    expect(container.querySelector("filter")).not.toBeNull();
  });
  it("stays on the first text under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<MorphingText texts={["One", "Two"]} hold={10} />);
    const layers = container.querySelectorAll("span[aria-hidden=true]:not(.invisible)");
    expect(layers[0]).toHaveTextContent("One");
  });
});
