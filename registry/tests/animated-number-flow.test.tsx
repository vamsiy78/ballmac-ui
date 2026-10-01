import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const motion = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({ ...(await importOriginal<typeof import("motion/react")>()), useReducedMotion: () => motion.reduce }));

import { AnimatedNumberFlow } from "@/components/ballmac/animated-number-flow";

afterEach(() => {
  motion.reduce = false;
});

const read = (c: HTMLElement) => c.querySelector(".sr-only")!.textContent;

describe("AnimatedNumberFlow", () => {
  it("exposes the formatted number as text", () => {
    const { container } = render(<AnimatedNumberFlow value={1234.5} />);
    expect(read(container)).toBe("1,234.5");
  });
  it("formats currency, percent and compact notation", () => {
    const { container: a } = render(<AnimatedNumberFlow value={1999} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />);
    expect(read(a)).toBe("$1,999");
    const { container: b } = render(<AnimatedNumberFlow value={0.256} format={{ style: "percent" }} />);
    expect(read(b)).toBe("26%");
    const { container: c } = render(<AnimatedNumberFlow value={48200} format={{ notation: "compact" }} />);
    expect(read(c)).toBe("48K");
  });
  it("adds prefix and suffix to the spoken text", () => {
    const { container } = render(<AnimatedNumberFlow value={42} prefix="About" suffix="ms" />);
    expect(read(container)).toBe("About42ms");
  });
  it("updates when the value changes", () => {
    const { container, rerender } = render(<AnimatedNumberFlow value={9} />);
    rerender(<AnimatedNumberFlow value={1234} />);
    expect(read(container)).toBe("1,234");
  });
  it("renders one rolling column per digit", () => {
    const { container } = render(<AnimatedNumberFlow value={305} />);
    expect(container.querySelectorAll("[aria-hidden=true] .invisible")).toHaveLength(3);
  });
  it("copes with a non-finite value and reduced motion", () => {
    motion.reduce = true;
    const { container } = render(<AnimatedNumberFlow value={Number.NaN} />);
    expect(read(container)).toBe("0");
  });
  it("can announce changes politely", () => {
    const { container } = render(<AnimatedNumberFlow value={1} announce />);
    expect(container.querySelector(".sr-only")).toHaveAttribute("aria-live", "polite");
  });
});
