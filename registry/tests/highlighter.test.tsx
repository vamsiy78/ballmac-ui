import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { Highlighter } from "@/components/ballmac/highlighter";

afterEach(() => {
  motion.reduce = false;
});

describe("Highlighter", () => {
  it("leaves the text readable and hides the mark from assistive tech", () => {
    const { container } = render(<Highlighter>key phrase</Highlighter>);
    expect(screen.getByText("key phrase")).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
  it("draws the right number of strokes for each mark", () => {
    const counts: Record<string, number> = { highlight: 1, underline: 1, strike: 1, box: 1, circle: 1, bracket: 2 };
    for (const [action, n] of Object.entries(counts)) {
      const { container, unmount } = render(<Highlighter action={action as "box"}>x</Highlighter>);
      expect(container.querySelectorAll("svg path")).toHaveLength(n);
      unmount();
    }
  });
  it("uses the chosen tone", () => {
    const { container } = render(<Highlighter tone="destructive">x</Highlighter>);
    expect(container.querySelector("svg")).toHaveClass("text-destructive");
  });
  it("draws marks completely under reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<Highlighter action="underline" inView>x</Highlighter>);
    expect(container.querySelector("svg path")).toBeInTheDocument();
  });
});
